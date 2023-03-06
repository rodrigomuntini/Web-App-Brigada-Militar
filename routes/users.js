const express = require('express');
const router = express.Router();
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);


router.get("/", (req, res) => {

    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

    let success_message = "";

    if (req.session.success_message) {
        success_message = req.session.success_message;
        delete req.session.success_message;
    }

    let page = req.query.page || 1;
    let search = req.query.search ? "&search=" + req.query.search : "";

    let sort = req.query.sort ? "&sort=" + req.query.sort : "";
    let column = req.query.column ? "&column=" + req.query.column : "";

    $.ajax({
        type: "GET",
        url: "http://ec2-107-21-160-174.compute-1.amazonaws.com:8002/api/users?page=" + page + search + sort + column,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            return res.render("users/list.html", {
                users: data.users,
                message: success_message,
                page: data.page,
                last_page: data.last_page,
                total: data.total,
                search: data.search,
                queries: req.query
            });
        },
        error: function (error) {
            return res.redirect("/login?error=Unauthorized");
        },
    });
});

router.get("/add", (req, res) => {
    res.render("users/add.html");
});

// POST CONTACT 
// router.post('/sendEmail', (req, res) => {
    
//     var email = req.body.email;
//     var subject = req.body.subject;

//     req.body.status = false;

//     if (email && subject) {
        
//         // send email to Client
//         nodeoutlook.sendEmail({
//             auth: {
//                 user: "novorumo054@outlook.com",
//                 pass: "Novorumopm"
//             },
//             from: 'novorumo054@outlook.com',
//             to: email,
//             subject: 'Administrador - Novo Rumo',
//             html:   '<div style="justify-content-center; text-align: center;">'+
//                         '<div><h2>Malotech Store</h2></div>'+
//                         '<div style="margin-bottom: 10px;"><h4>Olá, recebemos seu chamado em nosso site!</h4></div>'+
//                         '<div style="margin-bottom: 10px;"><h4>Nossa equipe irá analisar e em breve iremos retornar uma resposta.</h4></div>'+
//                         '<div><b>Equipe Malotech</b></div>'+
//                     '</div>',
//             replyTo: 'novorumo054@outlook.com',
//             onError: (e) => {
//                 console.log('Error', 'Send e-mail to client error: ' + e);
//             },
//             onSuccess: (i) => {
//                 console.log('info', 'Send e-mail to client: ' + i);
//             }
//         });
        
//         return res.status(200).json({ success: true, result: 'Email enviado', status: 200 });
        
//     } else {
//         console.log('error', 'Missing informations on create contact');
//     }
   
// });

router.post("/add", (req, res) => {

    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjY5NjA1ODMsImV4cCI6MTY2Njk4MjE4MywibmJmIjoxNjY2OTYwNTgzLCJqdGkiOiJlSVpidUowOWwzYUVwWE5UIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.T9NWr14eqtF1tdHcLBcbA0ZXQij-lwdjY4N008wXSK0";

    $.ajax({
        type: "POST",
        url: "http://ec2-107-21-160-174.compute-1.amazonaws.com:8002/api/users/add",
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: req.body,
        success: function (data) {
            req.session.success_message = "Servidor criado com sucesso!"
            return res.redirect('/users');
        },
        error: function (error) {
            console.log(error);
            return res.render('users/add.html', { 'request_body': req.body, 'error': error.responseJSON.error })
        },
    });
});

router.get("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

    $.ajax({
        type: "GET",
        url: "http://ec2-107-21-160-174.compute-1.amazonaws.com:8002/api/users/show/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            res.render("users/edit.html", { 'request_body': data.user });
        },
    });
});

router.post("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

    $.ajax({
        type: "POST",
        url: "http://ec2-107-21-160-174.compute-1.amazonaws.com:8002/api/users/edit/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: req.body,
        success: function (data) {
            // console.log(data);
            req.session.success_message = "Servidor alterado com sucesso!"
            return res.redirect('/users');
        },
        error: function (error) {
            // console.log(error);
            req.body._id = req.params.id;
            return res.render('users/edit.html', { 'request_body': req.body, 'error': error.responseJSON.error })
        },
    });
});

router.post("/delete/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

    $.ajax({
        type: "DELETE",
        url: "http://ec2-107-21-160-174.compute-1.amazonaws.com:8002/api/users/delete/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            // console.log(data);
            return res.send(true);
        },
        error: function (error) {
            // console.log(error);
            return res.send(false);
        },
    });
});

router.get("/view/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3OTU3MDU0LCJleHAiOjE2Njc5Nzg2NTQsIm5iZiI6MTY2Nzk1NzA1NCwianRpIjoicFpjczR5b29CMmNDbFh0SSIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.nLBDtJPwwVnu3aN39wZZthXsafvjXvDRuzt1HArl7Yc";

    let from = req.query.from ? "&from=" + req.query.from : "";
    let to = req.query.to ? "&to=" + req.query.to : "";

    $.ajax({
        type: "GET",
        url: "http://ec2-107-21-160-174.compute-1.amazonaws.com:8002/api/users/show/" + req.params.id + "?" + from + to,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            // console.log(data)
            // console.log(data.user.visits)
            res.render("users/view.html", { 'user': data.user });
        },
        error: function (error) {
            // console.log(error);
            return res.redirect("/login?error=Unauthorized");
        },
    });
});

module.exports = router;