const express = require('express');
const { type, data } = require('jquery');
const router = express.Router();
const { JSDOM } = require("jsdom");
const { restart } = require('nodemon');
const { window } = new JSDOM("");
const $ = require("jquery")(window);

// Visits
router.get("/", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3ODc0MDM5LCJleHAiOjE2Njc4OTU2MzksIm5iZiI6MTY2Nzg3NDAzOSwianRpIjoiNUdpdko5NE9uTjFTUERnUiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.Qkfyp8_cNhw7JiVRv3C9kz-z0tnaoLENZeRkfuoQqIY";

    let success_message = "";

    if (req.session.success_message) {
        success_message = req.session.success_message;
        delete req.session.success_message;
    }

    let page = req.query.page || 1;
    let searchOwner = req.query.o ? "&o=" + req.query.o : "";
    let searchProperty = req.query.c ? "&c=" + req.query.c : "";

    $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/properties?page=" + page + searchOwner + searchProperty,
        headers: {
            'Authorization': 'bearer ' + req.session.token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            $.ajax({
                type: "GET",
                url: "https://novo-rumo-api.herokuapp.com/api/owners/names",
                headers: {
                    'Authorization': 'bearer ' + req.session.token
                },
                success: function (d) {
                    return res.render("properties/list.html", {
                        properties: data.properties,
                        owners: d.owners,
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
        },
        error: function (error) {
            console.log(error);
            return res.redirect("/login?error=Unauthorized");
        },
    });
});

router.get('/add', (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3ODc0MDM5LCJleHAiOjE2Njc4OTU2MzksIm5iZiI6MTY2Nzg3NDAzOSwianRpIjoiNUdpdko5NE9uTjFTUERnUiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.Qkfyp8_cNhw7JiVRv3C9kz-z0tnaoLENZeRkfuoQqIY";

    $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/owners/names",
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        success: function (data) {
            var owners = data.owners;

            $.ajax({
                type: "GET",
                url: "https://novo-rumo-api.herokuapp.com/api/property-types/names",
                headers: {
                    'Authorization': 'bearer ' + req.session.token
                },
                success: function (data) {
                    var property_types = data.property_types;

                    $.ajax({
                        type: "GET",
                        url: "https://novo-rumo-api.herokuapp.com/api/vehicles/names",
                        headers: {
                            'Authorization': 'bearer ' + req.session.token
                        },
                        success: function (data) {
                            var vehicles = data.vehicles;

                            $.ajax({
                                type: "GET",
                                url: "https://novo-rumo-api.herokuapp.com/api/agricultural-machines/names",
                                headers: {
                                    'Authorization': 'bearer ' + req.session.token
                                },
                                success: function (data) {
                                    var agricultural_machines = data.agricultural_machines;

                                    res.render('properties/add.html', { 'owners': owners, 'property_types': property_types, 'vehicles': vehicles, 'agricultural_machines': agricultural_machines });
                                },
                                error: function (error) {
                                    return res.redirect("/login?error=Unauthorized");
                                },
                            });
                        },
                        error: function (error) {
                            return res.redirect("/login?error=Unauthorized");
                        },
                    });
                },
                error: function (error) {
                    return res.redirect("/login?error=Unauthorized");
                },
            });
        },
        error: function (error) {
            return res.redirect("/login?error=Unauthorized");
        },
    });
});

router.post('/add', (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3ODc0MDM5LCJleHAiOjE2Njc4OTU2MzksIm5iZiI6MTY2Nzg3NDAzOSwianRpIjoiNUdpdko5NE9uTjFTUERnUiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.Qkfyp8_cNhw7JiVRv3C9kz-z0tnaoLENZeRkfuoQqIY";

    let req_vehicles = typeof (req.body.vehicles) == 'string' ? [req.body.vehicles] : req.body.vehicles;
    let req_agricultural_machines = typeof (req.body.agricultural_machines) == 'string' ? [req.body.agricultural_machines] : req.body.agricultural_machines;

    for (index in req_vehicles) {
        req_vehicles[index] = {
            "id": req_vehicles[index],
            "color": "preto"
        };
    }

    let data = {
        "code": req.body.code,
        "has_geo_board": req.body.code != undefined ? true : false,
        "qty_people": req.body.qty_people,
        "has_cams": !req.body.has_cams ? false : true,
        "has_phone_signal": !req.body.has_phone_signal ? false : true,
        "has_internet": !req.body.has_internet ? false : true,
        "has_gun": !req.body.has_gun ? false : true,
        "has_gun_local": !req.body.has_gun_local ? false : true,
        "gun_local_description": req.body.gun_local_description,
        "qty_agricultural_defensives": !req.body.qty_agricultural_defensives ? 0 : req.body.qty_agricultural_defensives,
        "observations": req.body.observations,
        "fk_owner_id": req.body.owner,
        "fk_property_type_id": req.body.property_type,
        "vehicles": req_vehicles,
        "agricultural_machines": req_agricultural_machines
    };

    //   res.send(data);

    $.ajax({
        type: "POST",
        url: "https://novo-rumo-api.herokuapp.com/api/properties/add",
        headers: {
            'Authorization': 'bearer ' + req.session.token,
            'Content-Type': 'application/json'
        },
        data: data,
        success: function (data) {
            req.session.success_message = "Propriedade criada com sucesso!"
            return res.redirect('/properties');
        },
        error: function (error) {
            res.send(error)
            $.ajax({
                type: "GET",
                url: "https://novo-rumo-api.herokuapp.com/api/owners/names",
                headers: {
                    'Authorization': 'bearer ' + req.session.token
                },
                success: function (data) {
                    var owners = data.owners;

                    $.ajax({
                        type: "GET",
                        url: "https://novo-rumo-api.herokuapp.com/api/property-types/names",
                        headers: {
                            'Authorization': 'bearer ' + req.session.token
                        },
                        success: function (data) {
                            var property_types = data.property_types;

                            $.ajax({
                                type: "GET",
                                url: "https://novo-rumo-api.herokuapp.com/api/vehicles/names",
                                headers: {
                                    'Authorization': 'bearer ' + req.session.token
                                },
                                success: function (data) {
                                    var vehicles = data.vehicles;

                                    $.ajax({
                                        type: "GET",
                                        url: "https://novo-rumo-api.herokuapp.com/api/agricultural-machines/names",
                                        headers: {
                                            'Authorization': 'bearer ' + req.session.token
                                        },
                                        success: function (data) {
                                            var agricultural_machines = data.agricultural_machines;

                                            return res.render('properties/add.html', { 'request_body': req.body, 'error': error.responseJSON.error, 'owners': owners, 'property_types': property_types, 'vehicles': vehicles, 'agricultural_machines': agricultural_machines })
                                        },
                                        error: function (error) {
                                            return res.redirect("/login?error=Unauthorized");
                                        },
                                    });
                                },
                                error: function (error) {
                                    return res.redirect("/login?error=Unauthorized");
                                },
                            });
                        },
                        error: function (error) {
                            return res.redirect("/login?error=Unauthorized");
                        },
                    });
                },
                error: function (error) {
                    return res.redirect("/login?error=Unauthorized");
                },
            });
        },
    });
});

router.get("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY4MDgxMjc4LCJleHAiOjE2NjgxMDI4NzgsIm5iZiI6MTY2ODA4MTI3OCwianRpIjoibGF0ZnltQ1BONWMzREdCVyIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.POd2aq0vYKZpUD7TTmYaXSEiDvbjG3FBZ_vFLufv7B0";

    $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/properties/show/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            data.property.owner = data.property.fk_owner_id;
            data.property.property_type = data.property.fk_property_type_id;

            console.log(data.property);

            data_vehicles = [];
            if (data.property.vehicles.length > 0) {
                for (index in data.property.vehicles) {
                    console.log(index);
                    data_vehicles.push(data.property.vehicles[index]._id);
                }
                data.property.vehicles = data_vehicles;
            }

            data_agricultural_machines = [];
            if (data.property.agricultural_machines.length > 0) {
                for (index in data.property.agricultural_machines) {
                    data_agricultural_machines.push(data.property.agricultural_machines[index]._id);
                }
                data.property.agricultural_machines = data_agricultural_machines;
            }

            $.ajax({
                type: "GET",
                url: "https://novo-rumo-api.herokuapp.com/api/owners/names",
                headers: {
                    'Authorization': 'bearer ' + req.session.token
                },
                success: function (d) {
                    var owners = d.owners;

                    $.ajax({
                        type: "GET",
                        url: "https://novo-rumo-api.herokuapp.com/api/property-types/names",
                        headers: {
                            'Authorization': 'bearer ' + req.session.token
                        },
                        success: function (d) {
                            var property_types = d.property_types;

                            $.ajax({
                                type: "GET",
                                url: "https://novo-rumo-api.herokuapp.com/api/vehicles/names",
                                headers: {
                                    'Authorization': 'bearer ' + req.session.token
                                },
                                success: function (d) {
                                    var vehicles = d.vehicles;

                                    $.ajax({
                                        type: "GET",
                                        url: "https://novo-rumo-api.herokuapp.com/api/agricultural-machines/names",
                                        headers: {
                                            'Authorization': 'bearer ' + req.session.token
                                        },
                                        success: function (d) {
                                            var agricultural_machines = d.agricultural_machines;

                                            return res.render("properties/edit.html", { 'request_body': data.property, 'owners': owners, 'property_types': property_types, 'agricultural_machines': agricultural_machines, 'vehicles': vehicles });
                                        },
                                        error: function (error) {
                                            return res.redirect("/login?error=Unauthorized");
                                        },
                                    });
                                },
                                error: function (error) {
                                    return res.redirect("/login?error=Unauthorized");
                                },
                            });
                        },
                        error: function (error) {
                            return res.redirect("/login?error=Unauthorized");
                        },
                    });
                },
                error: function (error) {
                    return res.redirect("/login?error=Unauthorized");
                },
            });
        },
    });
});

router.post("/edit/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY4MDgxMjc4LCJleHAiOjE2NjgxMDI4NzgsIm5iZiI6MTY2ODA4MTI3OCwianRpIjoibGF0ZnltQ1BONWMzREdCVyIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.POd2aq0vYKZpUD7TTmYaXSEiDvbjG3FBZ_vFLufv7B0";

    let req_vehicles = typeof (req.body.vehicles) == 'string' ? [req.body.vehicles] : req.body.vehicles;
    let req_agricultural_machines = typeof (req.body.agricultural_machines) == 'string' ? [req.body.agricultural_machines] : req.body.agricultural_machines;

    for (index in req_vehicles) {
        req_vehicles[index] = {
            "id": req_vehicles[index],
            "color": "preto"
        };
    }

    let data = {
        "code": req.body.code,
        "has_geo_board": req.body.code != undefined ? true : false,
        "qty_people": req.body.qty_people,
        "has_cams": !req.body.has_cams ? false : true,
        "has_phone_signal": !req.body.has_phone_signal ? false : true,
        "has_internet": !req.body.has_internet ? false : true,
        "has_gun": !req.body.has_gun ? false : true,
        "has_gun_local": !req.body.has_gun_local ? false : true,
        "gun_local_description": req.body.gun_local_description,
        "qty_agricultural_defensives": !req.body.qty_agricultural_defensives ? 0 : req.body.qty_agricultural_defensives,
        "observations": req.body.observations,
        "fk_owner_id": req.body.owner,
        "fk_property_type_id": req.body.property_type,
        "vehicles": req_vehicles,
        "agricultural_machines": req_agricultural_machines
    };

    $.ajax({
        type: "POST",
        url: "https://novo-rumo-api.herokuapp.com/api/properties/edit/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token
        },
        data: data,
        success: function (data) {
            console.log(data);
            req.session.success_message = "Propriedade alterada com sucesso!"
            return res.redirect('/properties');
        },
        error: function (error) {
            console.log(error);
            req.body._id = req.params.id;

            $.ajax({
                type: "GET",
                url: "https://novo-rumo-api.herokuapp.com/api/owners/names",
                headers: {
                    'Authorization': 'bearer ' + req.session.token
                },
                success: function (d) {
                    var owners = d.owners;

                    $.ajax({
                        type: "GET",
                        url: "https://novo-rumo-api.herokuapp.com/api/property-types/names",
                        headers: {
                            'Authorization': 'bearer ' + req.session.token
                        },
                        success: function (d) {
                            var property_types = d.property_types;

                            $.ajax({
                                type: "GET",
                                url: "https://novo-rumo-api.herokuapp.com/api/vehicles/names",
                                headers: {
                                    'Authorization': 'bearer ' + req.session.token
                                },
                                success: function (d) {
                                    var vehicles = d.vehicles;

                                    $.ajax({
                                        type: "GET",
                                        url: "https://novo-rumo-api.herokuapp.com/api/agricultural_machines/names",
                                        headers: {
                                            'Authorization': 'bearer ' + req.session.token
                                        },
                                        success: function (d) {
                                            var agricultural_machines = d.agricultural_machines;

                                            return res.render("properties/edit.html", { 'request_body': req.body, 'error': error.responseJSON.error, 'owners': owners, 'property_types': property_types, 'agricultural_machines': agricultural_machines, 'vehicles': vehicles });
                                        },
                                        error: function (error) {
                                            return res.redirect("/login?error=Unauthorized");
                                        },
                                    });
                                },
                                error: function (error) {
                                    return res.redirect("/login?error=Unauthorized");
                                },
                            });
                        },
                        error: function (error) {
                            return res.redirect("/login?error=Unauthorized");
                        },
                    });
                },
                error: function (error) {
                    return res.redirect("/login?error=Unauthorized");
                },
            });
        },
    });
});

router.post("/delete/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY3ODc0MDM5LCJleHAiOjE2Njc4OTU2MzksIm5iZiI6MTY2Nzg3NDAzOSwianRpIjoiNUdpdko5NE9uTjFTUERnUiIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.Qkfyp8_cNhw7JiVRv3C9kz-z0tnaoLENZeRkfuoQqIY";

    $.ajax({
        type: "DELETE",
        url: "https://novo-rumo-api.herokuapp.com/api/properties/delete/" + req.params.id,
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

router.get("/view/:id", (req, res) => {
    // req.session.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbm92by1ydW1vLWFwaS5oZXJva3VhcHAuY29tL2FwaS9hdXRoL2xvZ2luIiwiaWF0IjoxNjY4MDgxMjc4LCJleHAiOjE2NjgxMDI4NzgsIm5iZiI6MTY2ODA4MTI3OCwianRpIjoibGF0ZnltQ1BONWMzREdCVyIsInN1YiI6IjYzMzg4MDBjNjZhOGQ4ZGIwODA0MjgxMiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.POd2aq0vYKZpUD7TTmYaXSEiDvbjG3FBZ_vFLufv7B0";

    $.ajax({
        type: "GET",
        url: "https://novo-rumo-api.herokuapp.com/api/properties/show/" + req.params.id,
        headers: {
            'Authorization': 'bearer ' + req.session.token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            console.log(data.property.visits);
            return res.render("properties/view.html", { 'property': data.property });
        },
    });
});

module.exports = router;