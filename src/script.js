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
const homepage = document.querySelector(".homepage");

let togglei, togglem;

const errorMsg = function () {
  const html = document.createElement("p");

  html.innerHTML = `<h1>Please search again  !!</h1>`;

  document.querySelector("body").append(html);
};

//Home Navigation
navContainer.addEventListener("click", function (e) {
  const tabClicked = e.target.textContent;
  if (tabClicked === "HOME") {
    togglem = 1;
    togglei = 1;
    currImage1 = 0;
    currImage2 = 0;
    quizContainer.classList.add("hidden");
    homepage.classList.remove("hidden");
    //titlesContainer.classList.remove("hidden");
    //moviedetailsContainer.classList.remove("hidden");
    //imageContainer.classList.remove("hidden");
    startTrending();
    startPopular();
  } else if (tabClicked === "QUIZ") {
    quizContainer.classList.remove("hidden");
    homepage.classList.add("hidden");
    //titlesContainer.classList.add("hidden");
    //moviedetailsContainer.classList.add("hidden");
    //imageContainer.classList.add("hidden");
    currFilter.classList.remove("hidden");
    pic.querySelector("p").classList.add("hidden");
    initialiseQuiz();
    initquizVariables();
  } else {
    return;
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
  //console.log(currImage);
  //console.log(sliderBtn1);
  //console.log("Click Slider");

  //console.log(currImage);
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
  //console.log(lat, lng);
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
  //console.log(movieObj);

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
  //console.log(category);
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

//getTrivia().then((res) => console.log(res));

let currImage1 = 0;
imageContainer
  .querySelector(".slider__btn--right")
  .addEventListener("click", function () {
    currImage1++;
    //console.log(currImage1);
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
    //console.log(currImage2);
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
    //console.log(currImage1);

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

//bollywoodReco().then((data) => console.log(data));

const movies = {
  "movie-1": { imgpath: `scene-1.jpg`, answer: ["sholay"] },
  "movie-2": { imgpath: `scene-2.jpg`, answer: ["deewar"] },
  "movie-3": {
    imgpath: `scene-3.jpg`,
    answer: [
      "ddlj",
      "dilwale dulhania le jayenge",
      "dilwale dulhania le jaenge",
    ],
  },
  "movie-4": { imgpath: `scene-4.jpg`, answer: ["dil chahta hai"] },
  "movie-5": { imgpath: `scene-5.jpg`, answer: ["chak de india"] },
  "movie-6": { imgpath: `scene-6.jpg`, answer: ["a wednesday"] },
  "movie-7": {
    imgpath: `scene-7.jpg`,
    answer: ["gangs of wasseypur", "gangs of waseypur"],
  },
  "movie-8": { imgpath: `scene-8.jpg`, answer: ["damini"] },
  "movie-9": { imgpath: `scene-9.jpg`, answer: ["dil se"] },
  "movie-10": { imgpath: `scene-10.jpg`, answer: ["karan arjun"] },
  "movie-11": { imgpath: `scene-11.jpg`, answer: ["lagaan"] },
  "movie-12": {
    imgpath: `scene-12.jpg`,
    answer: ["pyar ka punchnama", "pyaar ka punchnama"],
  },
  "movie-13": { imgpath: `scene-13.jpg`, answer: ["3 idiots"] },
  "movie-14": { imgpath: `scene-14.jpg`, answer: ["namaste london"] },
  "movie-15": { imgpath: `scene-15.jpg`, answer: ["agneepath"] },
  "movie-16": { imgpath: `scene-16.jpg`, answer: ["taare zameen par"] },
  "movie-17": { imgpath: `scene-17.jpg`, answer: ["border"] },
  "movie-18": { imgpath: `scene-18.jpg`, answer: ["devdas"] },
  "movie-19": { imgpath: `scene-19.jpg`, answer: ["masaan"] },
  "movie-20": { imgpath: `scene-20.jpg`, answer: ["swades"] },
};

//////QUIZ SECTION//////

const button = document.querySelector(".quizButton");
const timer = document.querySelector(".timer");
const pic = document.querySelector(".picAnswer");
const currFilter = pic.querySelector("img");
const answer = pic.querySelector(".answer");
const scoreTitle = document.querySelector(".restofquiz").querySelector("h2");
const intro = document.querySelector(".instructions");
const score = document.querySelector(".score");
const buttspan = button.querySelector("span");
let time;
let questNo;
let startTime = 0;
let newBlur;
let answeredQues = [0];
let randomNum = 0;
let answerInput;
let closeQuiz;
let newScore = 0;
const startQuiz = function () {
  closeQuiz = setInterval(function () {
    time = +timer.textContent;
    //console.log(time);
    time = time - 1;
    timer.querySelector("span").textContent = `${time}`;
    startTime += 1;

    if (startTime % 2 === 0) {
      newBlur = parseInt(
        getComputedStyle(currFilter).getPropertyValue("--blurValue")
      );
      newBlur -= 1;
      currFilter.style.setProperty("--blurValue", `${newBlur}px`);
    }

    if (time < 15) {
      timer.style.backgroundColor = "#e03131";
    }
    if (time < 1) {
      calculateScore();
      timer.style.backgroundColor = "#12b886";
      newQues();
      return;
    }
  }, 1000);
};

button.addEventListener("click", function () {
  if (answeredQues.length - 1 === 20) {
    pic.querySelector("p").classList.remove("hidden");
    currFilter.classList.add("hidden");
    intro.classList.add("hidden");
    buttspan.textContent = "START";
    initialiseQuiz();
    return;
  }
  buttspan.textContent = "Playing !!";
  initialiseQuiz();
  renderQuizimg();
  startQuiz();
});

const calculateScore = function () {
  if (time >= 50 && time <= 60) {
    newScore += 10;
  } else if (time >= 40 && time < 50) {
    newScore += 8;
  } else if (time >= 30 && time < 40) {
    newScore += 6;
  } else if (time > 20 && time < 10) {
    newScore += 2;
  } else {
    newScore += 0;
  }
  //console.log(newScore);
  return;
};

const newQues = function () {
  score.textContent = newScore;
  timer.querySelector("span").textContent = `${60}`;
  currFilter.style.setProperty("--blurValue", `${0}px`);
  buttspan.textContent = "Next Question";
  console.log(buttspan.textContent);
  clearInterval(closeQuiz);
  //renderQuizimg();
  //startQuiz();
};
const closeGame = function () {
  score.textContent = newScore;
  timer.querySelector("span").textContent = `${60}`;
  currFilter.style.setProperty("--blurValue", `${0}px`);

  buttspan.textContent = "START";
  newScore = 0;
  scoreTitle.textContent = "GAME OVER ⏱️! Your Final Score ✨🎉";

  //questNo += 1;
  clearInterval(closeQuiz);
};

const renderQuizimg = function () {
  while (answeredQues.includes(randomNum)) {
    randomNum = Math.trunc(Math.random() * 20 + 1);
    //console.log(randomNum);
  }
  answeredQues.push(randomNum);
  questNo = randomNum;
  currFilter.style.setProperty("--blurValue", `${20}px`);
  //console.log(`movie-${questNo}`);
  currFilter.src = movies[`movie-${questNo}`].imgpath;
};

answer.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    //console.log(event.key);
    console.log(answer.value.toLowerCase());
    //  console.log(movies[`movie-${questNo}`].answer);
    //answeredQues.includes(randomNum);
    console.log(
      movies[`movie-${questNo}`].answer.includes(answer.value.toLowerCase())
    );
    //if (answer.value.toLowerCase() === movies[`movie-${questNo}`].answer)
    if (
      movies[`movie-${questNo}`].answer.includes(answer.value.toLowerCase())
    ) {
      calculateScore();

      answer.style.backgroundColor = "#087f5b";
      answer.style.color = "white";
      answer.style.textAlign = "center";
      pic.querySelector("span").textContent = " ✅  Right Answer !!";

      //console.log(answer.value);

      if ((answeredQues.length - 1) % 5 === 0) {
        closeGame();
        return;
      }

      newQues();
    } else {
      answer.style.backgroundColor = "#ffe3e3";
      answer.style.color = "inherit";
      answer.style.textAlign = "center";
      this.value = "";
      pic.querySelector("span").textContent = " ❌ Try Again !!";
    }
  }
});

const initialiseQuiz = function () {
  console.log(answeredQues);
  currFilter.src = "opening.jpg";
  currFilter.style.setProperty("--blurValue", `${0}px`);
  answer.value = "";
  answer.style.backgroundColor = "inherit";
  answer.style.color = "inherit";
  timer.style.backgroundColor = "#12b886";
  scoreTitle.textContent = "SCORE";
  score.textContent = newScore;
  pic.querySelector("span").textContent = "";
};

const initquizVariables = function () {
  startTime = 0;
  randomNum = 0;
  newScore = 0;
};
