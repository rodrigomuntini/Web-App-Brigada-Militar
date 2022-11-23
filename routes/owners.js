const express = require('express');
const router = express.Router();
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);

//Owners
router.get("/", (req, res) => {

    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NTE2NjU2LCJleHAiOjE2Njc1MzgyNTYsIm5iZiI6MTY2NzUxNjY1NiwianRpIjoiY0Nsem5ZNGRaUU1LZXVLZiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.QTF6UHCaaadOQua-tL8tKToVXQfNhOqm4RCFB-gcFWU";

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
        url: "http://localhost:8000/api/owners?page=" + page + search + sort + column,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            return res.render("owners/list.html", {
                owners: data.owners,
                message: success_message,
                page: data.page,
                last_page: data.last_page,
                total: data.total,
                search: data.search
            });
        },
        error: function (error) {
            return res.redirect("/login?error=Unauthorized");
        },
    });
});

router.get("/add", (req, res) => {
    res.render("owners/add.html");
});

router.post("/add", (req, res) => {

    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3OTY1OTU4LCJleHAiOjE2Njc5ODc1NTgsIm5iZiI6MTY2Nzk2NTk1OCwianRpIjoiN1FJRlBmZzl2UktjUE9uSyIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.0nRFx8uIACrTza7UIXplJ59hUx7w8XDY51qqsJzHkHs";

    $.ajax({
        type: "POST",
        url: "http://localhost:8000/api/owners/add",
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: req.body,
        success: function (data) {
            req.session.success_message = "Proprietário criado com sucesso!"
            return res.redirect('/owners');
        },
        error: function (error) {
            console.log(error);
            return res.render('owners/add.html', { 'request_body': req.body, 'error': error.responseJSON.error })
        },
    });
});

router.get("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3OTY1OTU4LCJleHAiOjE2Njc5ODc1NTgsIm5iZiI6MTY2Nzk2NTk1OCwianRpIjoiN1FJRlBmZzl2UktjUE9uSyIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.0nRFx8uIACrTza7UIXplJ59hUx7w8XDY51qqsJzHkHs";

    $.ajax({
        type: "GET",
        url: "http://localhost:8000/api/owners/show/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            res.render("owners/edit.html", { 'request_body': data.owner });
        },
    });
});

router.post("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

    $.ajax({
        type: "POST",
        url: "http://localhost:8000/api/owners/edit/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: req.body,
        success: function (data) {
            console.log(data);
            req.session.success_message = "Servidor alterado com sucesso!"
            return res.redirect('/owners');
        },
        error: function (error) {
            console.log(error);
            req.body._id = req.params.id;
            return res.render('owners/edit.html', { 'request_body': req.body, 'error': error.responseJSON.error })
        },
    });
});

router.post("/delete/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2NjcxNjgyMzEsImV4cCI6MTY2NzE4OTgzMSwibmJmIjoxNjY3MTY4MjMxLCJqdGkiOiI5MkVMMjZSOW5MSE1UR2xLIiwic3ViIjoiNjMzODgwMGM2NmE4ZDhkYjA4MDQyODEyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.omwW3-31UZ40SvTF3-1rgmUc1JqKHIOOsmS78Z8vZEM";

    $.ajax({
        type: "DELETE",
        url: "http://localhost:8000/api/owners/delete/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            console.log(data);
            return res.send(true);
        },
        error: function (error) {
            console.log(error);
            return res.send(false);
        },
    });
});

module.exports = router;