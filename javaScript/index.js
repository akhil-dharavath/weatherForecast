let linkData = {};
async function getnavigator() {
  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (success) => resolve(success.coords),
      (error) => reject(error)
    );
  });
  return position;
}

async function cityFunction() {
  var city = document.getElementById("pincode").value;
  var apiKey = "117bfe6be263d54afb55f47b46b6daf1";
  let data = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
  );
  try {
    const jsonData = await data.json();
    return jsonData;
  } catch (error) {
    alert(error.message);
  }
}

async function fetchData(place, goingTo, indexjs) {
  if (indexjs) {
    document.getElementById("loadingHere").innerHTML = `<h1 style="position: fixed; top: 10%; left: 50%; transform: translate(-50%, -50%); color: black">Loading...</h1>`;
  } else {
    document.getElementById("mainDivContainer").innerHTML = `<h1 style="position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); color: white;">Loading...</h1>`;
  }
  try {
    locationCoords = { lat: "", lon: "" };
    cityName = ''
    if (place === "") {
      // get coordinates
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (success) => resolve(success.coords),
          (error) => reject(error)
        );
      });
      locationCoords.lat = position.latitude;
      locationCoords.lon = position.longitude;
    } else {
      let receivedData = await cityFunction();
      locationCoords.lat = receivedData.coord.lat;
      locationCoords.lon = receivedData.coord.lon;
      cityName = receivedData.name
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${locationCoords.lat}&lon=${locationCoords.lon}&exclude=minutely&units=metric&appid=117bfe6be263d54afb55f47b46b6daf1`);
    const data = await response.json();
    delete data.alerts;
    delete data.hourly;
    delete data.current;
    delete data.daily;
    delete data.timezone;
    delete data.timezone_offset;
    data['city'] = cityName;
    window.location.href = `${goingTo === "index" ? "home" : goingTo}.html?data=${encodeURIComponent(JSON.stringify(data))}`;
  } catch (error) {
    if (indexjs) {
      document.getElementById("loadingHere").innerHTML = `<h1 style="position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); color: black"></h1>`;
    }
    alert("Unable to fetch1", error.message);
  }
}

async function getData(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=117bfe6be263d54afb55f47b46b6daf1`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    alert("Unable to fetch:", error.message);
  }
}

async function navbar(place) {
  const dataParam = getQueryParam("data");
  const linkData = await JSON.parse(decodeURIComponent(dataParam));
  delete linkData.alerts;
  delete linkData.hourly;
  delete linkData.current;
  delete linkData.daily;
  delete linkData.timezone;
  delete linkData.timezone_offset;
  document.getElementsByTagName("nav")[0].innerHTML = `
  <div class="container-fluid">
    <a class="navbar-brand" href="./home.html?data=${encodeURIComponent(JSON.stringify(linkData))}">Weather App</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a href="./home.html?data=${encodeURIComponent(JSON.stringify(linkData))}" class="nav-link ${place === "home" ? "active" : ""}" aria-current="page" >Home</a>
        </li>
        <li class="nav-item">
          <a href="./hourWise.html?data=${encodeURIComponent(JSON.stringify(linkData))}" class="nav-link ${place === "hourWise" ? "active" : ""}" >Hour wise</a>
        </li>
        <li class="nav-item">
          <a href="./weakWise.html?data=${encodeURIComponent(JSON.stringify(linkData))}" class="nav-link ${place === "weakWise" ? "active" : ""}" >Weak wise</a>
        </li>
        <li class="nav-item">
          <a href="./about.html?data=${encodeURIComponent(JSON.stringify(linkData))}" class="nav-link ${place === "about" ? "active" : ""}" >About</a>
        </li>
      </ul>
      <form class="d-flex" role="search">
        <input class="form-control mx-1" id="pincode" type="text" placeholder="Enter City or Pincode" aria-label="Search" />
        <button class="btn btn-outline-success mx-1" type="button" onclick="fetchData('${place}','${place}')">Search</button>
        <button class="btn btn-outline-primary mx-1" type="button" class="button" onclick="fetchData('','${place}')" >Get Device Location</button>
      </form>
    </div>
  </div>
  `;
}

function getQueryParam(name) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(name);
}

async function home() {
  document.getElementById("mainDivContainer").innerHTML = `<h1 style="position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); color: white">Loading...</h1>`;
  const dataParam = getQueryParam("data");
  const geolocationData = await JSON.parse(decodeURIComponent(dataParam));
  const actualData = await getData(geolocationData.lat, geolocationData.lon);
  document.getElementById("mainDivContainer").innerHTML = `
    <div class="mainSection">
      <section id="homeContainer" class="homeContainer"></section>
      <section id="currentWeather"></section>
      <section id="weakly" class="weakyly"></section>
    </div>`;

  navbar("home");
  const place = geolocationData.city ? geolocationData.city : `Time Zone: ${actualData.timezone}`;
  const month = ["January", "Febraury", "March", "April", "May", "June", "July", "Augest", "September", "October", "November", "December"];
  const current = actualData.current;
  const daily = actualData.daily;
  const hourly = actualData.hourly;
  // new Date(timestamp*1000) // to date in utc format
  const hourlyForecast = hourly.map((data, hourlyIndex) => {
    if (hourlyIndex <= 5) {
      hourlyIndex++;
      return `${new Date(data.dt * 1000).getHours()}: ${new Date(
        data.dt * 1000
      ).getMinutes()}`;
    }
  });
  const dailyForecast = daily.map((data, index = 0) => {
    index++;
    return {
      date: `${new Date(data.dt * 1000).getDate()}/${new Date(data.dt * 1000).getMonth() + 1
        }`,
      max: data.temp.max,
      min: data.temp.min,
      weather: data.weather[0].description,
      main: data.weather[0].main,
      rain: data.rain,
      humidity: data.humidity,
      sunrise: `${new Date(data.sunrise * 1000).getHours()}:${new Date(
        data.sunrise * 1000
      ).getMinutes()}`,
      sunset: `${new Date(data.sunrise * 1000).getHours()}:${new Date(
        data.sunset * 1000
      ).getMinutes()}`,
    };
  });
  let hourlyIndex = 0;
  const Time = new Date();
  document.getElementById("homeContainer").innerHTML = `
    <h3>${place}, ${Time.getHours()}:${Time.getMinutes()} on ${month[Time.getMonth()]} ${Time.getDate()}</h3>
    <div class="homeCard">
      <div>
        <h1>${Math.round(current.temp)}</h1>
        <h2>${current.weather[0].main}</h2>
      </div>
      <div>
        <img id="weatherIcon" src="" alt=${current.weather[0].main
    } />
      </div>
    </div>
    <div class="homeMinMax">
      <div>
        <p>Maximum</>
        <p>${Math.round(daily[0].temp.max)}&deg;</p>
      </div>
      <div>
        <p>Minimum</p>
        <p>${Math.round(daily[0].temp.min)}&deg;</p>
      </div>
      <div>
        <p>Sun Rise</p>
        <p>${new Date(current.sunrise * 1000).getHours()}:${new Date(current.sunrise * 1000).getMinutes()} AM</p>
      </div>
      <div>
        <p>Sun Set</p>
        <p>${new Date(current.sunset * 1000).getHours() - 12}:${new Date(current.sunset * 1000).getMinutes()} PM</p>
      </div>
    </div>
    `;
  document.getElementById("currentWeather").innerHTML = `
  <div class="cards">
    <div class="card1">
      <div class="heading">
        <h3>Today's Weather</h3>
      </div>
      <div class="item">
        <p>Session</p>
        <p>Temperature</p>
      </div>
      <div class="item">
        <p>Morning</p>
        <p>${Math.round(daily[0].temp.morn)}&deg;</p>
      </div>
      <div class="item">
        <p>Afternoon</p>
        <p>${Math.round(daily[0].temp.day)}&deg;</p>
      </div>
      <div class="item">
        <p>Evening</p>
        <p>${Math.round(daily[0].temp.eve)}&deg;</p>
      </div>
        <div class="item">
          <p>Night</p>
          <p>${Math.round(daily[0].temp.night)}&deg;</p>
        </div>
      </div>
      <div class="card1">
          <div class="heading">
            <h3>Current Weather</h3>
          </div>
      <div class="item">
        <p>Feels Like</p>
        <p>${Math.round(current.feels_like)}&deg;</p>
      </div>
      <div class="item">
        <p>Humidity</p>
        <p>${current.humidity}%</p>
      </div>
      <div class="item">
        <p>Pressure</p>
        <p>${current.pressure} hPa</p>
      </div>
      <div class="item">
        <p>Wind Speed</p>
        <p>${current.wind_speed} m/s</p>
      </div>
      <div class="item">
        <p>Dew Point</p>
        <p>${Math.round(current.dew_point)}&deg;</p>
      </div>
    </div>
    <div class="card1">
      <div class="heading">
        <h3>Hourly Forecast</h3>
      </div>
      <div class="item">
        <p>Time</p>
        <p>Temperature</p>
        <p class='clearHourlyHumidity'>Humidity</p>
      </div>
        ${hourlyForecast.map((data) => {
    hourlyIndex++;
    if (hourlyIndex < 5) {
      return `
            <div class="item">
              <p>${hourlyForecast[hourlyIndex]}</p>
              <p>${Math.round(hourly[hourlyIndex].temp)}&deg;</p>
              <p class='clearHourlyHumidity'>${hourly[hourlyIndex].humidity}</p>
            </div>
          `;
    }
  }).join("")}
      </div>
    </div>`;

  document.getElementById("weakly").innerHTML = `
    <div class="heading">
      <h3>Weakly Weather Forcast</h3>
    </div>
    <div class="dayWiseCard">
      <div>
        <h2>Date</h2>
        <h2>Min / Max Temp</h2>
        <h2 class="clearWeather">Weather</h2>
        <h2 class="clearMainWeather">Weather</h2>
        <h2 class="clearHumidity">Humidity</h2>
      </div>${dailyForecast.map((data) => `
        <div>
          <p>${data.date}</p>
          <p>${data.min} / ${data.max}</p>
          <p class="clearWeather">${data.weather}</p>
          <p class="clearMainWeather">${data.main}</p>
          <p class="clearHumidity">${data.humidity}%</p>
        </div>`).join("")}
      </div>`;
  let weatherMain = daily[0].weather[0].main;
  let weatherIcon = document.getElementById("weatherIcon");
  weatherIcon.setAttribute(
    "src",
    weatherMain === "Rain"
      ? "./img/rain.svg"
      : weatherIcon === "Clouds"
        ? "./img/cloud.svg"
        : weatherIcon === "Haze"
          ? "./img/haze.svg"
          : weatherIcon === "Snow"
            ? "./img/snow.svg"
            : weatherIcon === "Strom"
              ? "./img/strom.svg"
              : "./img/clear.svg"
  );
  weatherIcon.setAttribute("alt", daily[0].weather[0].description);
  weatherIcon.setAttribute("width", "100px");
}

async function hourWise() {
  document.getElementById("mainDivContainer").innerHTML = `<h1 style="position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); color: white">Loading...</h1>`;
  const dataParam = getQueryParam("data");
  const geolocationData = await JSON.parse(decodeURIComponent(dataParam));
  const actualData = await getData(geolocationData.lat, geolocationData.lon);
  document.getElementById("mainDivContainer").innerHTML = `
    <div class="accordion" id="accordion"></div>`;

  navbar("hourWise");
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const hourly = actualData.hourly;
  let todaysDate = new Date(hourly[0].dt * 1000).getDate();
  let hourlyIndex = -1;
  document.getElementById("accordion").innerHTML = hourly.map((data) => {
    hourlyIndex++;
    let collapsed = hourlyIndex === 0 ? "" : "collapsed";
    let expanded = hourlyIndex === 0 ? false : true;
    let dataTime = new Date(data.dt * 1000).getHours();
    let setTime = dataTime > 11 ? `${dataTime - 12 === 0 ? "12" : dataTime - 12} PM` : `${dataTime} AM`;
    let dataDate = new Date(data.dt * 1000).getDate();
    let setDate = dataDate === todaysDate ? "today" : `${dataDate}, ${month[new Date(data.dt * 1000).getMonth() + 1]}`;
    return ` ${setDate === "today" && hourlyIndex === 0 ? `<h1>Today</h1>` : setTime === "0 AM" ? `<h1>${setDate}</h1>` : ""}
    <div class="accordion-item">
      <h2 class="accordion-header">
      <div class="accordion-button ${collapsed}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${hourlyIndex}" aria-expanded=${expanded} aria-controls="collapse${hourlyIndex}">
        <p>${setTime}</p> 
        <p>${Math.round(data.temp)}&deg;</p>
        <p>${data.weather[0].main}</p>
        <p>Humidity: ${data.humidity}%</p> 
      </div>
      </h2>
      <div id="collapse${hourlyIndex}" class="accordion-collapse collapse ${!expanded ? "show" : ""}" data-bs-parent="#accordion">
        <div class="accordion-body">
          <div>
            <p>weather</p>
            <p>${data.weather[0].description}</p>
          </div>
          <div>
            <p>Feels Like</p>
            <p>${Math.round(data.feels_like)}&deg;</p>
          </div>
          <div>
            <p>Pressure</p>
            <p>${Math.round(data.pressure)} hPa</p>
          </div>
          <div>
            <p>Dew Point</p>
            <p>${Math.round(data.dew_point)}&deg;</p>
          </div>
          <div>
            <p>UV Index</p>
            <p>${data.uvi}</p>
          </div>
          <div>
            <p>WindSpeed</p> 
            <p>${data.wind_speed} m/s</p> 
          </div>
          <div>
            <p>Visibility</p> 
            <p>${data.visibility}</p> 
          </div>
          <div>
            <p>Clouds Cover</p> 
            <p>${data.clouds}%</p> 
          </div>
        </div>
      </div>
    </div>`;
  }).join("");
}

async function weakWise() {
  document.getElementById("mainDivContainer").innerHTML = `<h1 style="position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); color: white">Loading...</h1>`;
  const dataParam = getQueryParam("data");
  const geolocationData = await JSON.parse(decodeURIComponent(dataParam));
  const actualData = await getData(geolocationData.lat, geolocationData.lon);
  document.getElementById("mainDivContainer").innerHTML = `
    <div class="accordion" id="accordion"></div>`;

  navbar("weakWise");
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daily = actualData.daily;
  let todaysDate = new Date(daily[0].dt * 1000).getDate();
  let dailyIndex = -1;
  document.getElementById("accordion").innerHTML = daily.map((data) => {
    dailyIndex++;
    let collapsed = dailyIndex === 0 ? "" : "collapsed";
    let expanded = dailyIndex === 0 ? false : true;
    let dataDate = new Date(data.dt * 1000).getDate();
    let setDate = dataDate === todaysDate ? "today" : `${dataDate}, ${month[new Date(data.dt * 1000).getMonth() + 1]}`;
    return ` ${collapsed === "" ? `<h1></h1>` : ""}
    <div class="accordion-item">
      <h2 class="accordion-header">
      <div class="accordion-button ${collapsed}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${dailyIndex}" aria-expanded=${expanded} aria-controls="collapse${dailyIndex}">
        ${setDate === "today" ? `<p>Today</p>` : `<p>${setDate}</p>`}
        <p>${Math.round(data.temp.max)}&deg;/ ${Math.round(data.temp.min)}&deg;</p>
        <p>${data.weather[0].main}</p>
        <p>Humidity: ${data.humidity}%</p> 
      </div>
      </h2>
      <div id="collapse${dailyIndex}" class="accordion-collapse collapse ${!expanded ? "show" : ""}" data-bs-parent="#accordion">
        <div class="accordion-body">
          <div>
            <p>weather</p>
            <p>${data.weather[0].description}</p>
          </div>
          <div>
            <p>Feels Like</p>
            <p>${Math.round(data.feels_like.day)}&deg;</p>
          </div>
          <div>
            <p>Pressure</p>
            <p>${Math.round(data.pressure)} hPa</p>
          </div>
          <div>
            <p>Dew Point</p>
            <p>${Math.round(data.dew_point)}&deg;</p>
          </div>
          <div>
            <p>UV Index</p>
            <p>${data.uvi}</p>
          </div>
          <div>
            <p>WindSpeed</p> 
            <p>${data.wind_speed} m/s</p> 
          </div>
          <div>
            <p>Wind Gusts</p> 
            <p>${data.wind_gust} m/s</p> 
          </div>
          <div>
            <p>Clouds Cover</p> 
            <p>${data.clouds}%</p> 
          </div>
        </div>
      </div>
    </div>`}).join("");
}

async function about() {

  navbar("about");
  document.getElementById("about").innerHTML =
  `
  <p>This weather app is one of best free weather apps with full features: Local weather, weather map and weather widgets.</p>
  <p class='generateSpace'></p
  <p>Forecast : Forecast now, hourly forecast and daily forecast app</p>
  <p>Weather map : Rain/snow, temperature, pressure, windy, clouds, humidity, waves.</p>
  <p class='generateSpace'></p
  <p>Its so easy to receive the weather conditions in your current location.</p>
  <p>Weather forecast app provides detailed local forecast & weather forecast world wide, the app provides the current temperature in Celsius.</p>
  <p>The weather app also provides atmospheric pressure, weather conditions, relative humidity and wind speed, in addition to one week in future and hourly weather forecast.</p>
  <p>Realtime temperature, humidity, pressure and wind speed are all in the weather app based.</p>
  <p class='generateSpace'></p
  <p>Great features:</p>
  <p>- The weather channel: temperature, wind, humidity, atmosphere pressure, water, storm, stormshield, rain alert in one wetter app</p>
  <p>- Hourly or daily prediction: we offer 7 days info, the weather now, hourly weather free in each hour, today’s weather, tomorrow’s weather</p>
  <p>- Animated weather conditions with live weather images</p>
  <p>- Hourly and weekly forecastle, especially hourly weather item for next 7 days.</p>
  <p>- World weather report: we provide worldwide weather forecast</p>
  <p>- Storm warning: Storm tracker, tornado warning and rain alarm</p>
  <p>- Reporting: the weather news can show up everyday if you enable it.</p>
  <p>- Wind guru tool: wind forecast by wind speed meter, wind finder</p>
  <p>- 1 day, 7 days future prediction with accurate el tiempo, plus tempo data for future hourly weather</p>
  <p>- Weather widget (weather on homescreen) and ongoing notification with forecast bar, multiple place on widgets.</p>
  <p>- Auto reload data for notification even app is in underground</p>
  <p>- Weather notification bar: Keeps weather running underground for realtime, you can see the temperature on android system bar without opening app</p>
  <p>- Lock screen with info: temps, rain, clouds & clock widget weather</p>
  <p>- Track the whether in multiple locations</p>
  <p>- Great wether radar with animated maps</p>`
}