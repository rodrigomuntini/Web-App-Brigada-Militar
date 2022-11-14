const express = require('express');
const router = express.Router();
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);

router.get("/", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    let success_message = "";

    if (req.session.success_message) {
        success_message = req.session.success_message;
        delete req.session.success_message;
    }

    let page = req.query.page || 1;
    let search = req.query.search ? "&search=" + req.query.search : "";

    $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/property-types?page=" + page + search,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            return res.render("property-types/list.html",{
                property_types: data.property_types,
                message: success_message,
                page: data.page,
                last_page: data.last_page,
                total: data.total,
                search: data.search
            });
        },
        error: function (error) {
            console.log(error);
            return res.redirect("/login?error=Unauthorized");
        },
    });
});

router.get("/add", (req, res) => {
    res.render("property-types/add.html");
});

router.post("/add", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    $.ajax({
        type: "POST",
        url: "https://novo-rumo-api.herokuapp.com/api/property-types/add",
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: req.body,
            success: function (data) {
            req.session.success_message = "Tipo de propriedade criado com sucesso!"
            return res.redirect('/property-types');
        },
        error: function (error) {
            return res.render('property-types/add.html', { 'request_body': req.body, 'error': error.responseJSON.error })
        },
    });
});

router.get("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/property-types/show/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            res.render("property-types/edit.html", { 'request_body': data.property_type });
        },
    });
});

router.post("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    $.ajax({
        type: "POST",
        url: "https://novo-rumo-api.herokuapp.com/api/property-types/edit/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: req.body,
        success: function (data) {
            console.log(data);
            req.session.success_message = "Tipo de propriedade alterado com sucesso!"
            return res.redirect('/property-types');
        },
        error: function (error) {
            console.log(error);
            req.body._id = req.params.id;
            return res.render('property-types/edit.html', { 'request_body': req.body, 'error': error.responseJSON.error })
        },
    });
});

router.post("/delete/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    $.ajax({
        type: "DELETE",
        url: "https://novo-rumo-api.herokuapp.com/api/property-types/delete/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            return res.send(true);
        },
        error: function (error) {
            console.log(error);
            return res.send(false);
        },
    });
});

module.exports = router;