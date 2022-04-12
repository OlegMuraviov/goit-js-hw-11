import './main.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
const axios = require('axios').default;

const BASE_KEY = '26705242-dfe8a614970af38263da25f99';
let PAGE = 1;
let currentRequest = '';

const formNode = document.querySelector('form');
const galleryNode = document.querySelector('.gallery');
const loadMoreNode = document.querySelector('.load-more');

formNode.addEventListener('submit', onFormSubmit);
loadMoreNode.addEventListener('click', onLoadMoreClick);

async function getData(value, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: BASE_KEY,
        q: value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page,
      },
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
  }
}

async function onFormSubmit(event) {
  event.preventDefault();
  PAGE = 1;
  currentRequest = event.target.elements[0].value;

  if (currentRequest === '') {
    loadMoreNode.classList.add('hiden');
    return Notify.info('Please input a value');
  }

  const result = await getData(currentRequest, PAGE);

  if (result.data.total === 0) {
    galleryNode.innerHTML = '';
    loadMoreNode.classList.add('hiden');
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
    );
  }

  if (result.data.totalHits > 40) loadMoreNode.classList.remove('hiden');
  Notify.success(`Hooray! We found ${result.data.totalHits} images.`);

  const photo = Object.values(result.data.hits)
    .map(element => createCard(element))
    .join('');
  galleryNode.innerHTML = photo;
}

async function onLoadMoreClick(event) {
  PAGE += +1;

  const result = await getData(currentRequest, PAGE);
  if (result.data.total === 0) {
    console.log(result.data);
    galleryNode.innerHTML = '';
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
    );
  }
  if (PAGE * 40 > result.data.totalHits) loadMoreNode.classList.add('hiden');
  Notify.success(`Hooray! We found ${result.totalHits} images.`);
  const photo = Object.values(result.data.hits)
    .map(element => createCard(element))
    .join('');
  galleryNode.insertAdjacentHTML('beforeend', photo);
}

function createCard(data) {
  return `<div class="photo-card">
  <div class="thumb">
  <img src="${data.webformatURL}" alt="${data.tags}" loading="lazy" /></div>
    
    <div class="info">
      <p class="info-item">
        <b>Likes ${data.likes}</b>
      </p>
      <p class="info-item">
        <b>Views ${data.views}</b>
      </p>
      <p class="info-item">
        <b>Comments ${data.comments}</b>
      </p>
      <p class="info-item">
        <b>Downloads ${data.downloads}</b>
      </p>
    </div>
  </div>`;
}
