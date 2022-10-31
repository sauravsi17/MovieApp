"use strict";

/*
TMDB auth Key : d25b922370ee92a985ecbe8ae4899c2f
https://api.themoviedb.org/3/movie/550?api_key=d25b922370ee92a985ecbe8ae4899c2f
https://api.themoviedb.org/3/movie/550?api_key=d25b922370ee92a985ecbe8ae4899c2f

&with_origin_country=IN&with_original_language=hi|kn|ml|ta|te
popular : https://api.themoviedb.org/3/movie/popular
upcoming : https://api.themoviedb.org/3/movie/now_playing?api_key=d25b922370ee92a985ecbe8ae4899c2f&region=${region}&with_origin_country=${region}
*/

//DOM elements//

const formElement = document.querySelector(".search");
const inputElement = formElement.querySelector("input");

const moviedetailsContainer = document.querySelector(".movie-details");

const imageContainer = document.querySelector(".load-images");

const navContainer = document.querySelector(".nav-links");

const mainBodycontainer = document.querySelector(".mainBody");

const titlesContainer = document.querySelector(".titles");

const quizContainer = document.querySelector(".quizques");

let togglei, togglem;

const errorMsg = function () {
  const html = document.createElement("p");

  html.innerHTML = `<h1>Please search again  !!</h1>`;

  document.querySelector("body").append(html);
};

//Home Navigation
navContainer.addEventListener("click", function (e) {
  const tabClicked = e.target.textContent;
  console.log(tabClicked);
  if (!tabClicked) {
    return;
  }

  if (tabClicked === "HOME") {
    togglem = 1;
    togglei = 1;
    currImage1 = 0;
    currImage2 = 0;
    quizContainer.classList.add("hidden");
    titlesContainer.classList.remove("hidden");
    moviedetailsContainer.classList.remove("hidden");
    imageContainer.classList.remove("hidden");
    startTrending();
    startPopular();
  } else {
    quizContainer.classList.remove("hidden");
    titlesContainer.classList.add("hidden");
    moviedetailsContainer.classList.add("hidden");
    imageContainer.classList.add("hidden");
  }
  removeImages();
  removeButtons();
});

//Navigation ANimation
navContainer.addEventListener("mouseover", function (e) {
  const siblings = navContainer.querySelectorAll("a");

  siblings.forEach((el) => {
    if (el != e.target) el.style.opacity = 0.5;
  });
});

navContainer.addEventListener("mouseout", function (e) {
  const siblings = navContainer.querySelectorAll("a");

  siblings.forEach((el) => {
    if (el != e.target) el.style.opacity = 1;
  });
});

const sliderBtn = function (loadImages) {
  console.log(currImage);
  //console.log(sliderBtn1);
  //console.log("Click Slider");

  console.log(currImage);
  loadImages.forEach((images, index) => {
    //console.log(index);
    images.style.transform = `translateX(${100 * (index - currImage)}%)`;
  });
  return;
};

// If location allowed : Get current lat long --> get current Country/Region --> Get Languages --> Get Trending List

//If Location Not allowed : Region :US, Language : EN  ---> Get Trending List

//Promise to Get Current Latitude Longitude
let currLatLong = new Object();
const getCurrlatlong = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition((position) => {
      currLatLong.latitude = +position.coords.latitude;
      currLatLong.longitude = +position.coords.longitude;
      resolve(currLatLong);
    });
  });
};

//Function to return current location using api-ninja APIs
const googleGeo = async function (lat, lng) {
  const res = await fetch(
    `https://api.api-ninjas.com/v1/reversegeocoding?lat=${lat}&lon=${lng}`,
    {
      headers: { "X-Api-Key": `1mkk6SWJyQ05+oddtyz1cA==ddIpeoXo3P1VrpQU` },
      contentType: "application/json",
    }
  );

  const [data] = await res.json();

  //console.log(data);
  return data;
};

//Function to return current location using
const getCurrentlocation = async function () {
  const res = await getCurrlatlong();
  //console.log(res);
  const currLoc_response = await fetch(
    `https://api.api-ninjas.com/v1/reversegeocoding?lat=${res.latitude}&lon=${res.longitude}`,
    {
      headers: { "X-Api-Key": `1mkk6SWJyQ05+oddtyz1cA==ddIpeoXo3P1VrpQU` },
      contentType: "application/json",
    }
  );

  const [currLoc_data] = await currLoc_response.json();

  return currLoc_data;
  //console.log(currLoc_data);
};

//getCurrentlocation();

//Promise to get current country/Region
let cntryData;
const getLangCountry = function (lat, lng) {
  console.log(lat, lng);
  return new Promise(function (resolve, reject) {
    cntryData = fetch(
      `https://geocode.xyz/${lat},${lng}?geoit=json&auth=339715904426005374316x102085`
    ).then((res) => res.json());
    resolve(cntryData);
  });
};

//Promise to get trending data based on region

let popular;
const getPopular = async function (region) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=d25b922370ee92a985ecbe8ae4899c2f&region=${region}&with_origin_country=${region}`
  );
  const data = await res.json();

  return data;
};
//Get the regional trending movies + serials

let trendData;

const getTrending = function (region) {
  //console.log(region);
  return new Promise(function (resolve, reject) {
    trendData = fetch(`
    https://api.themoviedb.org/3/movie/now_playing?api_key=d25b922370ee92a985ecbe8ae4899c2f&sort_by=popularity.desc&region=${region}&with_origin_country=${region}`).then(
      (res) => res.json()
    );
    resolve(trendData);
  });
};

/////Get/render trending Movies ////////////////
//////////////////////////////////////////////
const startTrending = function () {
  getCurrentlocation()
    .then((data) => getTrending(data.country))
    .then((data) => renderTrending(data.results));

  const renderTrending = function (data) {
    //console.log(data);

    data.forEach((element, index) => {
      getMovdetailsbyId(element.id).then((data) =>
        renderPosters(data, index, "trending")
      );
    });
  };
};

/////Get/render Popular Movies ////////////////
//////////////////////////////////////////////
const startPopular = function () {
  getCurrentlocation()
    .then((data) => getPopular(data.country))
    .then((data) => renderPopular(data.results));

  const renderPopular = function (data) {
    //console.log(data);

    data.forEach((element, index) => {
      getMovdetailsbyId(element.id).then((data) =>
        renderPosters(data, index, "popular")
      );
    });
  };
};

//////////////Search for Movies and render them //////////////////////
//////////////////////////////////////////////////////////////////////
let input;
let searchString = "";
let movieId;
inputElement.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchString = inputElement.value;
    //console.log(searchString);
    getMovdetails(searchString)
      .then(function (data) {
        movieId = +data.results[0].id;
        return getMovdetailsbyId(movieId);
      })
      .then((data) => {
        //console.log(data);
        rendermoviedata(data);
      })
      .catch((err) => console.log(err));
  }
});

let movieData;
const getMovdetails = function (query) {
  // console.log(query);
  return new Promise(function (resolve, reject) {
    movieData = fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=d25b922370ee92a985ecbe8ae4899c2f&query=${query}`
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`Please Enter again !!- ${res.status}`);
      }
      return res.json();
    });
    resolve(movieData);
  });
};

let movieDataid;
const getMovdetailsbyId = function (id) {
  // console.log(query);
  return new Promise(function (resolve, reject) {
    movieDataid = fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=d25b922370ee92a985ecbe8ae4899c2f&language=en-US&append_to_response=videos,images`
    ).then((res) => res.json());
    resolve(movieDataid);
  });
};

///////////////////Render movie details - Used to render movies searched by users ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const rendermoviedata = function (movieObj) {
  console.log(movieObj);

  titlesContainer.classList.add("hidden");

  removeButtons();

  removeImages();
  const movie_details = populateDetails(movieObj);
  movie_details.classList.add("newMovies");
  moviedetailsContainer.insertAdjacentElement("beforeend", movie_details);

  if (imageContainer.querySelector("img")) {
    imageContainer.querySelectorAll("img").forEach((e) => e.remove());
  }
  const newImg = document.createElement("img");
  newImg.classList.add("moviePoster");

  if (!movieObj.poster_path) {
    newImg.src = `\img-1.jpg`;
  } else {
    newImg.src = `https://image.tmdb.org/t/p/original/${movieObj.poster_path}`;
  }

  newImg.addEventListener("load", function () {
    imageContainer.append(newImg);
    newImg.style.margin = "auto";
    newImg.style.padding = "auto";
    newImg.style.width = "100%";
    newImg.style.height = "100%";

    newImg.style.objectFit = "contain";
  });
};

const populateDetails = function (movieObj) {
  const originalTitle = movieObj.title;
  const budget = movieObj.budget;
  const genres = [];
  let genreText = "";
  movieObj.genres.forEach((element) => genres.push(element.name));

  genres.forEach((e) => {
    genreText += `<span> ${e} </span>`;
  });
  //console.log(genreText);

  const homepage = movieObj.homepage;
  const imdb_id = movieObj.imdb_id;

  const overview = movieObj.overview;

  const releaseDate = movieObj.release_date;

  const boxOffice = movieObj.revenue;
  const tagline = movieObj.tagline;

  const prodCountries = [];

  movieObj.production_countries.forEach((element) =>
    prodCountries.push(element.name)
  );

  const movie = document.createElement("div");
  movie.innerHTML = ` <h1>${originalTitle}</h1>
  <p class = "${tagline}" >${tagline}</p>
  <p class = "${genres}" >GENRE : ${genreText}</p>
  <p class = "${releaseDate}" >RELEASE DATE: ${releaseDate}</p>
  <p class = "${budget}" >BUDGET: ${budget}</p>
  <p class = "${boxOffice}" >BOX OFFICE ${boxOffice}</p>
  <p class = "${overview}" ><h4>OVERVIEW</h4><br> ${overview}</p>`;

  return movie;
};

/////////////////////////Render Movie Posters - Used to reder home Page///////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

let trendingImages = [];
let popularImages = [];
const renderPosters = function (movieObj, index, category) {
  //console.log(movieObj);
  console.log(category);
  const originalTitle = movieObj.title;

  const homepage = movieObj.homepage;
  const movieId = movieObj.id;
  //console.log(movieObj.id);

  //console.log(moviedetailsContainer.querySelector(".newMovies"));
  if (moviedetailsContainer.querySelector(".newMovies")) {
    moviedetailsContainer.querySelector(".newMovies").remove();
  }

  //const newImg = document.createElement("button");
  const newImg = document.createElement("img");

  newImg.classList.add("slide");
  if (!movieObj.poster_path) {
    newImg.src = `\img-1.jpg`;
  } else {
    newImg.src = `https://image.tmdb.org/t/p/original/${movieObj.poster_path}`;
  }

  newImg.addEventListener("load", function () {
    if (category === "trending") {
      imageContainer.append(newImg);
      if (index > 1) loadButtons(imageContainer);
    } else {
      moviedetailsContainer.append(newImg);
      if (index > 1) loadButtons(moviedetailsContainer);
    }
    newImg.dataset.tab = `${movieId}`;
    newImg.style.margin = "0";
    newImg.style.padding = "0";
    //butt_newImg.style.width = "100%";
    //butt_newImg.style.height = "100%";
    newImg.style.transform = `translateX(${100 * index}%)`;
    newImg.style.objectFit = "contain";
    togglei = 1;
    togglem = 1;
  });

  trendingImages = imageContainer.querySelectorAll("img");
  popularImages = moviedetailsContainer.querySelectorAll("img");
};

let triviaData;
const getTrivia = function () {
  return new Promise(function (resolve, reject) {
    triviaData = fetch(
      "https://opentdb.com/api.php?amount=10&category=11"
    ).then((res) => res.json());
    resolve(triviaData);
  });
};

getTrivia().then((res) => console.log(res));

let currImage1 = 0;
imageContainer
  .querySelector(".slider__btn--right")
  .addEventListener("click", function () {
    currImage1++;
    console.log(currImage1);
    const allImages = imageContainer.querySelectorAll("img");
    if (currImage1 >= allImages.length) {
      currImage1 = allImages.length - 1;
      return;
    }
    //sliderBtn(imageContainer.querySelectorAll("img"));
    allImages.forEach((images, index) => {
      //console.log(index);
      images.style.transform = `translateX(${100 * (index - currImage1)}%)`;
    });
  });
let currImage2 = 0;
moviedetailsContainer
  .querySelector(".slider__btn--right")
  .addEventListener("click", function () {
    currImage2++;
    console.log(currImage2);
    const allImages = moviedetailsContainer.querySelectorAll("img");
    if (currImage2 >= allImages.length) {
      currImage2 = allImages.length - 1;
      return;
    }
    //sliderBtn(moviedetailsContainer.querySelectorAll("img"));
    allImages.forEach((images, index) => {
      //console.log(index);
      images.style.transform = `translateX(${100 * (index - currImage2)}%)`;
    });
  });

imageContainer
  .querySelector(".slider__btn--left")
  .addEventListener("click", function () {
    currImage1--;
    console.log(currImage1);

    const allImages = imageContainer.querySelectorAll("img");
    if (currImage1 < 0) {
      currImage1 = 0;
      return;
    }

    allImages.forEach((images, index) => {
      images.style.transform = `translateX(${100 * (index - currImage1)}%)`;
    });
  });

moviedetailsContainer
  .querySelector(".slider__btn--left")
  .addEventListener("click", function () {
    currImage2--;
    console.log(currImage2);

    const allImages = moviedetailsContainer.querySelectorAll("img");
    if (currImage2 < 0) {
      currImage2 = 0;
      return;
    }
    //sliderBtn(moviedetailsContainer.querySelectorAll("img"));
    allImages.forEach((images, index) => {
      //console.log(index);
      images.style.transform = `translateX(${100 * (index - currImage2)}%)`;
    });
  });
startTrending();
startPopular();

const removeImages = function () {
  if (imageContainer.querySelector(".movieInfo").querySelector(".modal")) {
    imageContainer.querySelector(".movieInfo").querySelector(".modal").remove();
  }
  if (imageContainer.querySelector("img")) {
    imageContainer.querySelectorAll("img").forEach((e) => e.remove());
  }

  if (moviedetailsContainer.querySelector("img")) {
    moviedetailsContainer.querySelectorAll("img").forEach((e) => e.remove());
  }

  if (moviedetailsContainer.querySelector(".newMovies")) {
    moviedetailsContainer
      .querySelectorAll(".newMovies")
      .forEach((e) => e.remove());
  }

  if (
    moviedetailsContainer.querySelector(".movieInfo").querySelector(".modal")
  ) {
    moviedetailsContainer
      .querySelector(".movieInfo")
      .querySelector(".modal")
      .remove();
  }
};

const loadButtons = function (element) {
  titlesContainer.classList.remove("hidden");
  element
    .querySelectorAll("button")
    .forEach((e) => e.classList.remove("hidden"));
};

imageContainer.addEventListener("click", function (event) {
  if (!event.target.classList.contains("slide")) {
    return;
  }

  togglei === 1 ? (togglei = 0.1) : (togglei = 1);

  event.target.style.opacity = `${togglei}`;
  movieModalswitch(imageContainer, togglei);
});

moviedetailsContainer.addEventListener("click", function (event) {
  if (!event.target.classList.contains("slide")) {
    return;
  }
  togglem === 1 ? (togglem = 0.1) : (togglem = 1);
  event.target.style.opacity = `${togglem}`;

  movieModalswitch(moviedetailsContainer, togglem);
});

const movieModalswitch = function (elementClicked, toggle) {
  const movieInfoModal = elementClicked.querySelector(".movieInfo");

  if (toggle < 1) {
    movieInfoModal.classList.remove("hidden");
    getMovdetailsbyId(`${event.target.dataset.tab}`).then((res) => {
      movieInfoModal.insertAdjacentElement("beforeend", populateDetails(res));
      movieInfoModal.querySelector("div").classList.add("modal");
    });
  } else {
    movieInfoModal.classList.add("hidden");
    movieInfoModal.querySelector(".modal").remove();
  }
};

const removeButtons = function () {
  moviedetailsContainer
    .querySelectorAll("button")
    .forEach((e) => e.classList.add("hidden"));
  imageContainer
    .querySelectorAll("button")
    .forEach((e) => e.classList.add("hidden"));
};

const bollywoodReco = async function () {
  const options = await fetch(
    "https://abir82-bollywood-recommendations.p.rapidapi.com?year=2018&genre=Comedy",
    {
      headers: {
        "X-RapidAPI-Key": "b6a4aa1fbemsh9126b3ba081abe1p16acb4jsn2b91abc1e197",
        "X-RapidAPI-Host": "abir82-bollywood-recommendations.p.rapidapi.com",
      },
    }
  );

  const data = await options.json();
  return data;
};

bollywoodReco().then((data) => console.log(data));

const movies = {
  "movie-1": { imgpath: `scene-1.jpg`, answer: "sholay" },
  "movie-2": { imgpath: `scene-2.jpg`, answer: "deewar" },
  "movie-3": {
    imgpath: `scene-3.jpg`,
    answer: "ddlj",
  },
  "movie-4": { imgpath: `scene-4.jpg`, answer: "dil chahta hai" },
  "movie-5": { imgpath: `scene-5.jpg`, answer: "chak de india" },
  "movie-6": { imgpath: `scene-6.jpg`, answer: "a wednesday" },
  "movie-7": { imgpath: `scene-7.jpg`, answer: "gangs of wasseypur" },
  "movie-8": { imgpath: `scene-8.jpg`, answer: "damini" },
  "movie-9": { imgpath: `scene-9.jpg`, answer: "dil Se" },
  "movie-10": { imgpath: `scene-10.jpg`, answer: "karan arjun" },
};

//////QUIZ SECTION//////

const button = document.querySelector(".quizButton");
const timer = document.querySelector(".timer");
const pic = document.querySelector(".picAnswer");
const currFilter = pic.querySelector("img");
const answer = pic.querySelector("input");

const score = document.querySelector(".score");
let time;
let questNo = 1;
let startTime = 0;
let newBlur;

let answerInput;
let closeQuiz;
const startQuiz = function () {
  console.log("Button Pressed");
  console.log(timer.textContent);
  closeQuiz = setInterval(function () {
    answer.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        console.log(answer.value);
        console.log(movies[`movie-${questNo}`].answer);
        if (answer.value == movies[`movie-${questNo}`].answer) {
          calculateScore();
          closeGame();
          return;
        }
      }
    });

    time = +timer.textContent;
    console.log(time);
    time = time - 1;
    timer.textContent = `${time}`;
    startTime += 1;

    if (startTime % 15 === 0) {
      newBlur = parseInt(
        getComputedStyle(currFilter).getPropertyValue("--blurValue")
      );
      newBlur -= 5;
      currFilter.style.setProperty("--blurValue", `${newBlur}px`);
    }

    if (time < 1) {
      calculateScore();
      closeGame();
      return;
    }
  }, 1000);
};

button.addEventListener("click", function () {
  button.textContent = "Playing !!";
  console.log(pic.querySelector("img"));
  currFilter.style.setProperty("--blurValue", `${20}px`);
  pic.querySelector("img").src = movies[`movie-${questNo}`].imgpath;

  startQuiz();
});

const calculateScore = function () {
  if (time >= 45 && time <= 60) {
    score.textContent = 10;
  } else if (time >= 30 && time < 45) {
    score.textContent = 6;
  } else if (time >= 15 && time < 30) {
    score.textContent = 4;
  } else if (time > 0 && time < 15) {
    score.textContent = 2;
  } else {
    score.textContent = 0;
  }
};

const closeGame = function () {
  console.log("It Should return");
  button.textContent = "Start ";
  timer.textContent = `${60}`;
  currFilter.style.setProperty("--blurValue", `${0}px`);
  questNo += 1;
  clearInterval(closeQuiz);
};
