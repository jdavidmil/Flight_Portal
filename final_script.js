var root_url = "http://comp426.cs.unc.edu:3001/";
$(document).ready(function() {

let user = "alexmb96";
let pass = "730010375";
var airports = [];
var flights = [];


    //Ajax POST call to immediately authenticate the user with a preregistered username and password
    $.ajax(root_url + "sessions",
	       {
		   type: "POST",
       data: {
         "user": {
		       "username": user,
		       "password": pass
		       }
     },
     xhrFields: {withCredentials: true},
		   success: (response) => {

           build_initial_interface();
		   },
       error: (jqxhr, status, error) => {
           alert(error);
       }
	       });

         $('body').on('click','.seatmap', function() {
           $('#seatmap_panel').empty();
          let url = $(this).parent().attr("data-url");
          let img = document.createElement("IMG");
             img.src = url;
             img.style.width = '25%';
             img.style.height = 'auto';
             $('#seatmap_panel').append(img);

         });

          $("body").on("click", ".srch_btn", function() {
            $(".response").empty();
            let depart = $(".searchbar1").val().toLowerCase();
            let dest = $(".searchbar2").val().toLowerCase();
            let city1;
            let city2;
            let airport1id;
            let airport2id;
            //Call to get an array of airport objects
            $.ajax(root_url + "airports",
                  {
                  type: 'GET',
                  dataType: 'json',
                  xhrFields: {withCredentials: true},
                  success: (response) => {
                    let i = 0;
                    for (i = 0; i < response.length; i++) {
                      if (response[i].city.toLowerCase().includes(depart)) {

                        city1 = response[i].name;
                        airport1id = response[i].id;
                      }
                      if (response[i].city.toLowerCase().includes(dest)) {
                        city2 = response[i].name;
                        airport2id = response[i].id;

                      }



                    }

              //Call to get an array of flights objects
                              $.ajax(root_url + "flights?filter[departure_id]=" + airport1id + "&filter[arrival_id]=" + airport2id,
                                    {
                                      type: 'GET',
                                      dataType: 'json',
                                      xhrFields: {withCredentials: true},
                                      success: (response) => {
                                                $(".response").append("<p>Found " + response.length + " flights between those cities!</p>");
                                                for (i = 0; i < response.length; i++) {
                                                  $(".response").append(create_flight_div(response[i], i, depart, dest));

                                                    //declare variables for use in nested calls
                                                    let flight_id = response[i].id;
                                                    let flight_num = response[i].number;
                                                    let airline_id = response[i].airline_id;
                                                    let plane_id = response[i].plane_id;
                                                    let flight_div_id = "flight"+i;

                                                      $.ajax(root_url + "airlines/" + airline_id,
                                                            {
                                                              type: 'GET',
                                                              dataType: 'json',
                                                              xhrFields: {withCredentials: true},
                                                              success: (response) => {

                                                                $('#'+flight_div_id+'').find(".flight_header").text(response.name + " Flight #" +flight_num);

                                                                    $.ajax(root_url + "planes/" + plane_id,
                                                                        {
                                                                        type: 'GET',
                                                                        dataType: 'json',
                                                                        xhrFields: {withCredentials: true},
                                                                        success: (response) => {

                                                                            $('#'+flight_div_id+'').find(".plane_info").text("Plane type: " + response.name + "  ");
                                                                              $('#'+flight_div_id+'').find(".plane_info").attr("data-url", response.seatmap_url);
                                                                              $('#'+flight_div_id+'').find(".plane_info").append("<button class = 'seatmap'>Show seat map</button>");

                                                                              $.ajax(root_url + "instances?filter[flight_id]=" +flight_id, {
                                                                                type: 'GET',
                                                                                dataType: 'json',
                                                                                xhrFields: {withCredentials: true},
                                                                                success: (response) => {

                                                                                    $(".cancellations").empty();
                                                                                    for (i = 0; i < response.length; i++) {

                                                                                      $(".cancellations").append(create_cancellation_div(response[i], i));


                                                                                    }

                                                                                }

                                                                              });

                                                                          },
                                                                            error: (jqxhr, status, error) => {
                                                                            alert(error);
                                                                            }

                                                                        });
                                                              },
                                                              error: (jqxhr, status, error) => {
                                                                alert(error);
                                                                }
                                                              });

                                                } //end for loop

                                          }, //end success
                    error: (jqxhr, status, error) => {
                        alert(error);

                     }
                   });


                  },
                  error: (jqxhr, status, error) => {
                      alert(error);

                    }
                  });

// HERE IS THE PUT AND POST CALLS FOR INSTANCES AND cancellations
  $("body").on("click", ".add", function() {
      let date = $(".date").val();
      let flightid = $(".flight_id").val();
      let cancelled = $("input[name='cancelled']:checked").val();
      let cancel;

      if (cancelled == 'true') {
        cancel = true;
      } else {
        cancel = false;
      }


        $.ajax({
          url: root_url+'instances',
          type: 'POST',
          data: {
              "instance": {
                "flight_id":    flightid,
                "date":         date,
                "is_cancelled": cancel,
                "info":         undefined
              }
            },
            xhrFields: { withCredentials: true },
            success: () => {
              alert("Created a new instance.");
            }
});

  });

    $("body").on("click", ".cancel", function() {

      let instanceid = $(".instance_id").val();
      let flightid = $(".flight_id").val();
      let date = $(".date").val();
      let cancelled = $("input[name='cancelled']:checked").val();
      let cancel;

      if (cancelled == 'true') {
        cancel = true;
      } else {
        cancel = false;
      }

      $.ajax({
        url: root_url+'instances/'+instanceid,
        type: 'PUT',
        data: {
          "instance": {
            "flight_id":    flightid,
            "date":         date,
            "is_cancelled": cancel,
            "info":         null
    }
  },
  xhrFields: { withCredentials: true },
  success: () => {
    if (cancel) {
      alert("Instance id " + instanceid + " successfully cancelled.");
    } else {
      alert("Instance id " + instanceid + " successfully renewed.");
    }

  }
});

    });







// HERE IS THE CALL FOR WEATHER::::::::::::::::::::::::::::::::::::::::::::::

              $.ajax("http://api.openweathermap.org/data/2.5/weather?q=" + dest + "&APPID=4a53443aff55776f7b0588e5235eb8a5&units=imperial", {
                  type: "GET",
                  dataType: "json",
                  success: (response) => {
                    update_weather_interface(response, dest);
                    }
                  });













        });


// END DOCUMENT READY:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::



});



var build_initial_interface = function () {
  let head = $(".header");
  let flights = $(".flights");
  let city = $(".city_info");

  head.append("<h1 class='welcome'>Welcome to your Flight Booking Portal</h1>");
  flights.append("<div class='departure'></div>");
  let dep = $(".departure");
  dep.append("<p>Please enter your preferred city of departure: </p>");
  dep.append("<input class='searchbar1'input type='text' placeholder='Search..' ></input>");
  flights.append("<div class='destination'></div>");
  let des = $(".destination");
  des.append("<p>Please enter your preferred destination: </p>");
  des.append("<input class='searchbar2'input type='text' placeholder='Search..' ></input>");
  flights.append("<button class='srch_btn'>Find My Ticket!</button>");
  flights.append("<div class='response'></div>");

// Builds Cancellation interface

  let cancel_header = $("<div class = 'cancellation_header'>Instances: :</div>");
  cancel_header.append(" Cancelled? <input type='radio' name='cancelled' value='true' class ='lo'> Yes");
  cancel_header.append("<input type='radio' name='cancelled' value='false' class ='lo'> No");
  cancel_header.append("<input class = 'flight_id' input type = 'number' placeholder = 'Flight id'></input>");
  cancel_header.append("<input class = 'instance_id' input type = 'number' placeholder = 'Instance id'></input>");
  cancel_header.append("<input class = 'date' input type = 'text' placeholder = 'Date'></input>");
  cancel_header.append("<button class = 'add'>Add Instance</button>");
  cancel_header.append("<button class = 'cancel'>Cancel/Renew</button>");
  let cancellations_div = $("<div class = 'cancellations'></div>");
  $(".status").append(cancel_header);
  $(".status").append(cancellations_div);

// Builds Weather Interface of Destination Info

  let weather = $("<div class = 'weather'></div>");
  let weather_text = $("<div class = 'weather_text' id='2'></div>");
  city.append(weather);
}

//Updates Weather Interface
var update_weather_interface = function(info, dest) {
  let weather_panel = $(".weather");
  let msg;
  if (info.main.temp < 40) {
    msg = "Better Pack a Parka! ";
  } else if (info.main.tmep > 70) {
    msg = "Bring some sunscreen! ";
  } else {
    msg = "";
  }
  weather_panel.empty();


  let url = "http://openweathermap.org/img/w/" + info.weather[0].icon +".png";
  let img = document.createElement("IMG");
  img.src = url;



  let div1 = $("<div class = 'info_div'></div>");
  div1.append("<p>" + msg + " Here's the weather in " + dest + " right now: </p>");
  div1.append("<p class='info'>Temperature (F): "+ info.main.temp+ " F</p>");
  div1.append("<p class='info'>Humidity: "+ info.main.humidity+"%</p>");
  div1.append("<p class='info'>Wind speed: "+info.wind.speed+" mph</p>");
  let text = "Precipitation: " + info.weather[0].description;
  div1.append("<p class = 'icon_title'>"+ text + "</p>");
  div1.append(img);



  weather_panel.append(div1);

}

var create_flight_div = function(flight, i, depart, arrive) {
  //number, derparture/arrival time, connecting flights?, plane, seats?

  //2000-01-01T01:38:00.000Z Format time to have a MM/DD/YYYY and a HH:MM:SS format
  let date_to_split = flight.departs_at;
  let date2_to_split = flight.arrives_at;
  let date_split = date_to_split.split("T");
  let date_split2 = date_to_split.split("T");
  let time1 = date_split[1].substring(0, 8);
  let time2 = date_split2[1].substring(0, 8);
  let date1 = date_split[0].substring(5, 7) + "/" + date_split[0].substring(8,10) + "/" + date_split[0].substring(0, 4);
  let date2 = date_split2[0].substring(5, 7) + "/" + date_split2[0].substring(8,10) + "/" + date_split2[0].substring(0, 4);

  //Create flight info layout
  let big_div = $("<div class='avail' id='flight"+i+"'></div>");
  let div = $("<div class='flight_header'></div>");
  let div2 = $("<div data-val='return' class = 'flight_info'>Departs from "+depart+" on " + date1 + " at " + time1 + "</div>");
  let div3 = $("<div data-val='return' class = 'flight_info2'>Arrives in "+arrive+" on "+ date2 + " at " + time2 + "</div>");
  let div4 = $("<div data-val='return' class = 'plane_info' data-url=''></div>");

  big_div.append(div);
  big_div.append(div2);
  big_div.append(div3);
  big_div.append(div4);

  return big_div;

}

var create_cancellation_div =  function(cancel, i) {

  let div = $("<div class = 'a_cancellation'></div>");

  let text;

      if (cancel.is_cancelled) {
          text = 'Cancelled';
        } else {
          text = 'Not cancelled';
        }

        div.append("<p class = 'canc'>User: "+cancel.user_id+"</p>");
        div.append("<p class = 'canc'>Flight status: "+ text + "</p>");
        div.append("<p class = 'canc'>Instance id: "+cancel.id+"</p>");
        div.append("<p class = 'canc'>Flight id: "+cancel.flight_id+"</p>");
        div.append("<p class = 'canc'>Date: "+cancel.date+"</p>");

    return div;

}
