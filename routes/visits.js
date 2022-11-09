const express = require('express');
const { type } = require('jquery');
const router = express.Router();
const { JSDOM } = require("jsdom");
const { restart } = require('nodemon');
const { window } = new JSDOM("");
const $ = require("jquery")(window);

// Visits
router.get("/", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3ODg2NjMxLCJleHAiOjE2Njc5MDgyMzEsIm5iZiI6MTY2Nzg4NjYzMSwianRpIjoiZVdkb3FCTHhIWDBjWnJGdyIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.P7qB9jVoN81UPwoEYaeGU-JKs7XINnu79DUjSZ6KU74";

    let success_message = "";

    if (req.session.success_message) {
      success_message = req.session.success_message;
      delete req.session.success_message;
    }
  
    let page = req.query.page || 1;
    let searchUser = req.query.u ? "&u=" + req.query.u : "";
    let searchProperty = req.query.p ? "&p=" + req.query.p : "";

    $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/visits?page=" + page + searchUser + searchProperty,
        headers: {
          'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
          return res.render("visits/list.html",{
            visits: data.visits,
            users: data.users,
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

router.get('/add', (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NzA4MTU0LCJleHAiOjE2Njc3Mjk3NTQsIm5iZiI6MTY2NzcwODE1NCwianRpIjoiU3pVSHBWTWVLM2Z3clRtOSIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.V3J4X_LoXdRPVt_I2fTfnGqrFIlHb7YVpSmdGCrMjfc";

    $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/properties/codes",
        headers: {
          'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            var properties = data.properties;
            var users = data.users;

            res.render('visits/add.html', {'properties': properties, 'users': users});
        },
        error: function (error) {
          return res.redirect("/login?error=Unauthorized");
        },
    });
});

router.post('/add', (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NzA4MTU0LCJleHAiOjE2Njc3Mjk3NTQsIm5iZiI6MTY2NzcwODE1NCwianRpIjoiU3pVSHBWTWVLM2Z3clRtOSIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.V3J4X_LoXdRPVt_I2fTfnGqrFIlHb7YVpSmdGCrMjfc";

  let req_users = typeof(req.body.users) == 'string' ? [req.body.users] : req.body.users;

  req_date = new Date(req.body.date);
  req_date = new Date(req_date.setHours(req_date.getHours() + 3));

  let dateFormat = req_date.getFullYear() + '-' + (req_date.getMonth() < 10 ? '0' + req_date.getMonth() : req_date.getMonth()) + '-' + (req_date.getDate() < 10 ? '0' + req_date.getDate() : req_date.getDate()) + 'T' + (req_date.getHours() < 10 ? '0' + req_date.getHours() : req_date.getHours()) + ":" + (req_date.getMinutes() < 10 ? '0' + req_date.getMinutes() : req_date.getMinutes());

  let data = {
    "car": req.body.car,
    "date": dateFormat,
    "fk_property_id": req.body.property,
    "users": req_users,
  };

  $.ajax({
    type: "POST",
    url: "https://novo-rumo-api.herokuapp.com/api/visits/add",
    headers: {
      'Authorization': 'bearer ' + req.session.token
    },
    data: data,
    success: function (data) {
      req.session.success_message = "Visita criada com sucesso!"
      return res.redirect('/visits');
    },
    error: function (error) {
      $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/properties/codes",
        headers: {
          'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            var properties = data.properties;
            var users = data.users;

            return res.render('visits/add.html', { 'request_body': req.body, 'error': error.responseJSON.error, 'properties': properties, 'users': users })
        },
        error: function (error) {
          return res.redirect("/login?error=Unauthorized");
        },
      });
    },
  });
});

router.get("/edit/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NzA4MTU0LCJleHAiOjE2Njc3Mjk3NTQsIm5iZiI6MTY2NzcwODE1NCwianRpIjoiU3pVSHBWTWVLM2Z3clRtOSIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.V3J4X_LoXdRPVt_I2fTfnGqrFIlHb7YVpSmdGCrMjfc";

  $.ajax({
      type: "GET",
      url: "https://novo-rumo-api.herokuapp.com/api/visits/show/" + req.params.id,
      headers: {
          'Authorization': 'bearer ' + req.session.token
      },
      success: function (data) {
          data.visit.property = data.visit.fk_property_id;

          data_users = [];
          for (index in data.visit.users) {
            data_users.push(data.visit.users[index]._id);
          }

          data.visit.users = data_users;

          $.ajax({
            type: "GET",
            url: "https://novo-rumo-api.herokuapp.com/api/properties/codes",
            headers: {
              'Authorization': 'bearer ' + req.session.token
            },
            success: function (d) {
                var properties = d.properties;
                var users = d.users;
    
                return res.render("visits/edit.html", { 'request_body': data.visit, 'properties': properties, 'users': users });
            },
            error: function (error) {
              return res.redirect("/login?error=Unauthorized");
            },
          });
      },
  });
});

router.post("/edit/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NzA4MTU0LCJleHAiOjE2Njc3Mjk3NTQsIm5iZiI6MTY2NzcwODE1NCwianRpIjoiU3pVSHBWTWVLM2Z3clRtOSIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.V3J4X_LoXdRPVt_I2fTfnGqrFIlHb7YVpSmdGCrMjfc";

  let req_users = typeof(req.body.users) == 'string' ? [req.body.users] : req.body.users;

  req_date = new Date(req.body.date);
  req_date = new Date(req_date.setHours(req_date.getHours() + 3));

  let dateFormat = req_date.getFullYear() + '-' + (req_date.getMonth() < 10 ? '0' + req_date.getMonth() : req_date.getMonth()) + '-' + (req_date.getDate() < 10 ? '0' + req_date.getDate() : req_date.getDate()) + 'T' + (req_date.getHours() < 10 ? '0' + req_date.getHours() : req_date.getHours()) + ":" + (req_date.getMinutes() < 10 ? '0' + req_date.getMinutes() : req_date.getMinutes());

  let data = {
    "car": req.body.car,
    "date": dateFormat,
    "fk_property_id": req.body.property,
    "users": req_users,
  };

  $.ajax({
      type: "POST",
      url: "https://novo-rumo-api.herokuapp.com/api/visits/edit/" + req.params.id,
      headers: {
          'Authorization': 'bearer ' + req.session.token
      },
      data: data,
      success: function (data) {
          console.log(data);
          req.session.success_message = "Visita alterada com sucesso!"
          return res.redirect('/visits');
      },
      error: function (error) {
          console.log(error);
          req.body._id = req.params.id;

          $.ajax({
            type: "GET",
            url: "https://novo-rumo-api.herokuapp.com/api/properties/codes",
            headers: {
              'Authorization': 'bearer ' + req.session.token
            },
            success: function (data) {
                var properties = data.properties;
                var users = data.users;
    
                return res.render('visits/edit.html', { 'request_body': req.body, 'error': error.responseJSON.error, 'properties': properties, 'users': users })
            },
            error: function (error) {
              return res.redirect("/login?error=Unauthorized");
            },
          });
      },
  });
});

router.post("/delete/:id", (req, res) => {
  // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NzA4MTU0LCJleHAiOjE2Njc3Mjk3NTQsIm5iZiI6MTY2NzcwODE1NCwianRpIjoiU3pVSHBWTWVLM2Z3clRtOSIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.V3J4X_LoXdRPVt_I2fTfnGqrFIlHb7YVpSmdGCrMjfc";

  $.ajax({
      type: "DELETE",
      url: "https://novo-rumo-api.herokuapp.com/api/visits/delete/" + req.params.id,
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