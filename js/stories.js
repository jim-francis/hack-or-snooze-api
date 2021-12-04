"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  //The solution provides the follow Boolean object wrapper, which seems like
  //the simpliest way to check the favorite status of the object
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
      ${showStar ? starHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Star markup for favorite/regular stories */

function starHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starBtn = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starBtn} fa-star"></i>
      </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitNewStory(evt){
  const title = $("#create-title").val();
  const author = $("#create-author").val();
  const url = $("#create-url").val()
  const username = currentUser.username;
  const storyData = {title, author, url, username};

  const story = await storyList.addStory(currentUser, storyData);
  console.log(story)

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

//Favorite functionality

function putFavoritesOnPage(){
  $favoriteStories.empty();

  if(currentUser.favorites.length === 0) {
    $favoriteStories.append("No favorite stories! Like something!")
  } else {
    for (let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoriteStories.append($story)
    }
  }
  $favoriteStories.show()
}

async function toggleFavorite(evt){
  const $target = $(evt.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");
  //seaches for a storyId with a matching id on current user
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($target.hasClass("fas")){
    await currentUser.removeFavorite(story)
    $target.closest("i").toggleClass("fas far")
  } else {
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fas far")
  }
}

$storiesLists.on("click", ".star", toggleFavorite)