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

    let sort = req.query.sort ? "&sort=" + req.query.sort : "";
    let column = req.query.column ? "&column=" + req.query.column : "";

    $.ajax({
        type: "GET",
        url: "http://0.0.0.0:8002/api/vehicles?page=" + page + search + sort + column,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            return res.render("vehicles/list.html",{
                vehicles: data.vehicles,
                message: success_message,
                page: data.page,
                last_page: data.last_page,
                total: data.total,
                search: data.search,
                queries: req.query
            });
        },
        error: function (error) {
            console.log(error);
            return res.redirect("/login?error=Unauthorized");
        },
    });
});

router.get("/add", (req, res) => {
    res.render("vehicles/add.html");
});

router.post("/add", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    $.ajax({
        type: "POST",
        url: "http://0.0.0.0:8002/api/vehicles/add",
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: req.body,
            success: function (data) {
            req.session.success_message = "Veículo criado com sucesso!"
            return res.redirect('/vehicles');
        },
        error: function (error) {
            return res.render('vehicles/add.html', { 'request_body': req.body, 'error': error.responseJSON.error })
        },
    });
});

router.get("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    $.ajax({
        type: "GET",
        url: "http://0.0.0.0:8002/api/vehicles/show/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            res.render("vehicles/edit.html", { 'request_body': data.vehicle });
        },
    });
});

router.post("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    $.ajax({
        type: "POST",
        url: "http://0.0.0.0:8002/api/vehicles/edit/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: req.body,
        success: function (data) {
            console.log(data);
            req.session.success_message = "Veículo alterado com sucesso!"
            return res.redirect('/vehicles');
        },
        error: function (error) {
            console.log(error);
            req.body._id = req.params.id;
            return res.render('vehicles/edit.html', { 'request_body': req.body, 'error': error.responseJSON.error })
        },
    });
});

router.post("/delete/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NjI5MDEzLCJleHAiOjE2Njc2NTA2MTMsIm5iZiI6MTY2NzYyOTAxMywianRpIjoiWUNmMm5QcEhFc1VTSlNpWiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.W7L1IYaU0i8c6FcBjaTZzjUFlGeZgyf1OQeuRtik700";

    $.ajax({
        type: "DELETE",
        url: "http://0.0.0.0:8002/api/vehicles/delete/" + req.params.id,
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