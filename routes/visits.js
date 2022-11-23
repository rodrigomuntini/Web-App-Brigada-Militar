const express = require('express');
const { type } = require('jquery');
const router = express.Router();
const { JSDOM } = require("jsdom");
const { restart } = require('nodemon');
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const mongoose = require('mongoose');
const { renderString } = require('nunjucks');

const Visit = mongoose.model('visits', {
  'car': String,
  'date': Date,
  'fk_property_id': String,
  'updated_at': Date,
  'created_at': Date,
});

const UserVisit = mongoose.model('user_visits', {
  'fk_visit_id': String,
  'fk_user_id': String,
  'updated_at': Date,
  'created_at': Date,
});

const User = mongoose.model('users', {
  'name': String,
  'email': String,
  'password': String,
  'updated_at': Date,
  'created_at': Date,
});

const Property = mongoose.model('properties', {
  'code': String,
  'has_geo_board': Boolean,
  'qty_people': Number,
  'has_cams': Boolean,
  'has_phone_signal': Boolean,
  'has_internet': Boolean,
  'has_gun': Boolean,
  'has_gun_local': Boolean,
  'gun_local_description': String,
  'qty_agricultural_defensives': Number,
  'observations': String,
  'fk_owner_id': String,
  'fk_property_type_id': String,
  'updated_at': Date,
  'created_at': Date,
  'latitude': String,
  'longitude': String,
});

const PropertyVehicle = mongoose.model('property_vehicles', {
  'color': String,
  'fk_property_id': String,
  'fk_vehicle_id': String,
  'updated_at': Date,
  'created_at': Date,
});

const PropertyAgriculturalMachine = mongoose.model('property_agricultural_machines', {
  'fk_property_id': String,
  'fk_agricultural_machine_id': String,
  'updated_at': Date,
  'created_at': Date,
});

const Vehicle = mongoose.model('vehicles', {
  'name': String,
  'brand': String,
  'updated_at': Date,
  'created_at': Date,
});

const AgriculturalMachine = mongoose.model('agricultural_machines', {
  'name': String,
  'updated_at': Date,
  'created_at': Date,
});

const Owner = mongoose.model('owners', {
  'firstname': String,
  'lastname': String,
  'address': String,
  'phone1': String,
  'phone2': String,
  'cpf': String,
  'updated_at': Date,
  'created_at': Date,
});

const Request = mongoose.model('requests', {
  'agency': String,
  'has_success': Boolean,
  'fk_property_id': String,
  'updated_at': Date,
  'created_at': Date,
})

router.get('/', async (req, res) => {
  let success_message = "";

  if (req.session.success_message) {
    success_message = req.session.success_message;
    delete req.session.success_message;
  }
  
  let visitArr = [];

  let search = {};

  //Search User
  if (req.query.u) {
    let user_visits = await UserVisit.find({'fk_user_id': req.query.u});

    for (index in user_visits) {
      if (!visitArr.includes(user_visits[index].fk_visit_id)) {
        visitArr.push(user_visits[index].fk_visit_id);
      }
    }
  }
  
  //Search Property
  if (req.query.p) {
    let properties = await Property.find({'code': req.query.p})

    for (index in properties) {
      let property_visits = await Visit.find({'fk_property_id': properties[index]._id});

      for (index2 in property_visits) {
        if (!visitArr.includes(property_visits[index2]._id)) {
          visitArr.push(property_visits[index2]._id);
        }
      }
    }
  }

  //Search from
  if (req.query.from && !req.query.to) {
    search['date'] = {$gte : new Date(req.query.from).toISOString()};
  }

  //Search to
  if (req.query.to && req.query.from) {
    search['date'] = {$lte : new Date(req.query.to).toISOString()};
  }

  //Search both dates
  if (req.query.from && req.query.to) {
    search['date'] = {$gte: new Date(req.query.from).toISOString(), $lte : new Date(req.query.to).toISOString()};
  }

  if (req.query.u || req.query.p) {
    search['_id'] = {"$in": visitArr };
  }

  // Order by
  let order = -1;
  if (req.query.sort) {
    if (req.query.sort == 'ASC' || req.query.sort == 'asc') {
      order = 1;
    }
  }

  let column = 'date';
  if (req.query.column) {
    if (req.query.column == 'code') {
      column = 'code';
    }
  }

  //Offset Page
  let page = 1;
  let elementsPerPage = 25;
  let skip = 0;
  let total = await Visit.countDocuments(search);

  if (req.query.page) {
    page = req.query.page;

    skip = (page - 1) * elementsPerPage;
  }

  let last_page = Math.ceil(total/elementsPerPage);
  
  let visits = await Visit.find(search).sort({'date': order}).skip(skip).limit(elementsPerPage);
  let users = await User.find().sort({name: 1});

  let propertiesArr = [];
  let garrisonArr = [];
  for (index in visits) {
    let property_id = visits[index].fk_property_id;
    let visit_id = visits[index]._id;

    let property = await Property.findById(property_id);
    propertiesArr[visit_id] = property;

    let users_visits = await UserVisit.find({'fk_visit_id': visit_id});
    garrisonArr[visit_id] = [];

    for (index2 in users_visits) {
      let user = await User.findById(users_visits[index2].fk_user_id);
      garrisonArr[visit_id].push(user);
    }
  }

  return res.render("visits/list.html",{
    visits: visits,
    properties: propertiesArr,
    garrison: garrisonArr,
    users: users,
    message: success_message,
    page: page,
    last_page: last_page,
    total: total,
    queries: req.query
  });
})

router.get('/add', (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3NzA4MTU0LCJleHAiOjE2Njc3Mjk3NTQsIm5iZiI6MTY2NzcwODE1NCwianRpIjoiU3pVSHBWTWVLM2Z3clRtOSIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.V3J4X_LoXdRPVt_I2fTfnGqrFIlHb7YVpSmdGCrMjfc";

    $.ajax({
        type: "GET",
        url: "http://localhost:8000/api/properties/codes",
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
    url: "http://localhost:8000/api/visits/add",
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
        url: "http://localhost:8000/api/properties/codes",
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
      url: "http://localhost:8000/api/visits/show/" + req.params.id,
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
            url: "http://localhost:8000/api/properties/codes",
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
      url: "http://localhost:8000/api/visits/edit/" + req.params.id,
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
            url: "http://localhost:8000/api/properties/codes",
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
      url: "http://localhost:8000/api/visits/delete/" + req.params.id,
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

router.get("/view/:id", async (req, res) => {
  let visits = await Visit.find({"_id": req.params.id});
  let visit = visits[0];
  let user_visits = await UserVisit.find({"fk_visit_id": visit._id});
  
  let users = [];
  for (index in user_visits) {
    let user = await User.find({'_id': user_visits[index].fk_user_id});
    users.push(user);
  }

  let properties = await Property.find({'_id': visit.fk_property_id});
  let property = properties[0];

  let property_types = await Property.find({'_id': property.fk_property_type_id});
  let property_type = property_types[0];

  let property_vehicles = await PropertyVehicle.find({'fk_property_id': property._id});
  let vehicles = [];
  for (index in property_vehicles) {
    let vehicle = await Vehicle.find({'_id': property_vehicles[index].fk_vehicle_id});
    vehicles.push(vehicle);
  }

  console.log(vehicles);

  let property_agricultural_machines = await PropertyAgriculturalMachine.find({'fk_property_id': property._id});
  let agricultural_machines = [];
  for (index in property_agricultural_machines) {
    let agricultural_machine = await AgriculturalMachine.find({'_id': property_agricultural_machines[index].fk_agricultural_machine_id});
    agricultural_machines.push(agricultural_machine);
  }

  let owners = await Owner.find({'_id': property.fk_owner_id});
  let owner = owners[0];

  let requests = await Request.find({'fk_property_id': property._id});
  let request = requests[0];

  res.render('visits/view.html', {'visit': visit, 'users': users, 'property': property, 'property_type': property_type, 'vehicles': vehicles, 'agricultural_machines': agricultural_machines, 'owner': owner, 'request': request});
});

module.exports = router;