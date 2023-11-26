import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.load-more'),
};
const { searchForm, gallery, btnLoadMore } = refs;
const paramsForNotify = {
    position: 'center-center',
    timeout: 4000,
    width: '400px',
    fontSize: '24px'
};

const perPage = 40;
let page = 1;
let keyOfSearchPhoto = '';

const URL = "https://pixabay.com/api/";
const KEY = "40896939-b0fae52e62fa17a0932cd40c3";

async function fetchPhoto(q, page, perPage) {
    const url = `${URL}?key=${KEY}&q=${q}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`;
    const response = await axios.get(url);
    return response.data;          
};

btnLoadMore.classList.add('is-hidden');

searchForm.addEventListener('submit', onSubmitForm);

function onSubmitForm(event) {
    event.preventDefault();

    gallery.innerHTML = '';
    page = 1;
    const { searchQuery } = event.currentTarget.elements;
    keyOfSearchPhoto = searchQuery.value
        .trim()
        .toLowerCase()
        .split(' ')
        .join('+');
    // console.log(keyOfSearchPhoto);

    if (keyOfSearchPhoto === '') {
        Notiflix.Notify.info('Enter your request, please!', paramsForNotify);
        return;
    }
    fetchPhoto(keyOfSearchPhoto, page, perPage)
        .then(data => {
            const searchResults = data.hits;
            if (data.totalHits === 0) {
                Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.', paramsForNotify);
            } else {
                Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`, paramsForNotify);
                // console.log(searchResults);
                createMarkup(searchResults);
                simpleLightBox = new SimpleLightbox('.img_wrap a').refresh();

            };
            if (data.totalHits > perPage) {
                btnLoadMore.classList.remove('is-hidden');
                window.addEventListener('scroll', showLoadMorePage);
            };
            // scrollPage();
        })
        .catch(onFetchError);

    btnLoadMore.addEventListener('click', onClickLoadMore);

    event.currentTarget.reset();
};

function showLoadMorePage() {
    if (checkIfEndOfPage()) {
        onClickLoadMore();
    };
};

function checkIfEndOfPage() {
    return (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
    );
}

function onClickLoadMore() {
    page += 1;
    fetchPhoto(keyOfSearchPhoto, page, perPage)
        .then(data => {
            const searchResults = data.hits;
            const numberOfPage = Math.ceil(data.totalHits / perPage);
            
            createMarkup(searchResults);
            if (page === numberOfPage) {
                btnLoadMore.classList.add('is-hidden');
                Notify.info("We're sorry, but you've reached the end of search results.", paramsForNotify);
                btnLoadMore.removeEventListener('click', onClickLoadMore);
                window.removeEventListener('scroll', showLoadMorePage);
            };
            simpleLightBox = new SimpleLightbox('.img_wrap a').refresh();
            // scrollPage();
        })
        .catch(onFetchError);
};

function onFetchError() {
        Notiflix.Notify.failure('Oops! Something went wrong! Try reloading the page or make another choice!', paramsForNotify);
};
    
function scrollPage() {
    const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
};

function createMarkup(searchResults) {
    const arrPhotos = searchResults.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `<div class="photo-card">
        <div class="img_wrap">
            <a class="gallery_link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" width="300" loading="lazy" />
            </a>
        </div>
        <div class="info">
            <p class="info-item">
            <b>Likes: ${likes}</b>
            </p>
            <p class="info-item">
            <b>Views: ${views}</b>
            </p>
            <p class="info-item">
            <b>Comments: ${comments}</b>
            </p>
            <p class="info-item">
            <b>Downloads: ${downloads}</b>
            </p>
        </div>
        </div>`
    });
    gallery.insertAdjacentHTML("beforeend", arrPhotos.join(''));
};

