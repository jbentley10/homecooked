import React from 'react';
import axios from 'axios';
import Login from '../components/Login';
import httpClient from '../../httpClient';

import RecipePage from './RecipePage';
import RecipeDetail from "../components/RecipeDetail";

// export default class Explore extends React.Component {
export default class Explore extends RecipePage {
  constructor(props) {
    super(props);
    this.state = {
      global_recipes: [],
      recipeDetail: {
        isActive: false,
        recipe: null,
        edit: false,
        idx: null
      }
    };
  }


  componentDidMount() {
    let { appState } = this.props;
    let userId = appState.currentUser._id;
    this.getGlobalRecipes(userId);
  }

  getGlobalRecipes(userId) {
    httpClient.allUnownedRecipes(userId).then((response) => {
      this.setState({
        global_recipes: response
      });
    });
  }

  render() {
    
    const { appState, updateAppState } = this.props;
    const { recipe, isActive, idx } = this.state.recipeDetail;

    if(appState.currentUser) {
      return (
        <div class="c-explore">
          <h1 class="c-explore__heading">Explore</h1>
          <div class="c-explore__page container">
            <section class="c-user-recipes container">
              {this.renderRecipesList()}
              <RecipeDetail
                recipe={recipe}
                isActive={isActive}
                recipeIdx={idx}
                editIsActive={this.state.recipeDetail.edit}
                renderIngredientList={this.renderIngredientList.bind(this)}
                renderInstructionsList={this.renderInstructionsList.bind(this)}
                userRecipes={this.state.userRecipes}
                handleToggleRecipeDetail={this.handleToggleRecipeDetail.bind(this)}
                handleAddToCookbook={this.handleAddToCookbook.bind(this)}
              />
            </section>
          </div>
        </div>
      );
    }
    else {
      return <Login updateAppState={updateAppState.bind(this)} />;
    }
  }

  renderRecipesList() {
    let recipes = this.state.global_recipes;

    if(recipes.length > 0) {
      return recipes.map((recipe, idx) => {
        recipe.ingredients = typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients;
        recipe.instructions = typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions;
        return this.renderRecipe(recipe, idx);
      });
    }
    else return null;
  }

  renderRecipe(recipe, idx) {
    const {
      name,
      imageUrl,
      cookingTime,
      user,
      servingSize,
      description
    } = recipe;
    const {
      hours,
      minutes,
      seconds
    } = cookingTime;

    let imgUrl = recipe.imageUrl ? recipe.imageUrl : './img/placeholder-recipe.jpg';

    return (
      <li onMouseOver={this.handleSetRecipe.bind(this, recipe)} 
          onClick={this.handleToggleRecipeDetail.bind(this, idx)} 
          key={idx} 
          class="c-user-recipes__list-item"
      >
        <div class="c-user-recipes__wrapper">
          <img class="c-user-recipes__image" src={imgUrl} alt={recipe.name} />
          <div class="c-user-recipes__info">
            <strong class=".c-recipe-detail__recipe-name">{recipe.name}</strong>
            <div class="c-user-recipes__user-lockup">
              <img src={user.imageUrl} class="c-user-recipes__user-image" />
              <span class="c-user-recipes__cook-time">
                {hours}
                {minutes}
                {seconds}
              </span>
              <span class="c-user-recipes__serving-size">
                {recipe.servingSize}
              </span>
            </div>
            <p class="c-user-recipes__blurb">{recipe.description}</p>
          </div>
        </div>
      </li>
    );
  }



  handleAddToCookbook(idx) {
    let newExploreRecipe = this.state.global_recipes[idx];
    let user =  this.props.appState.currentUser;

    let copiedRecipeWithCurrUser = {
      ...newExploreRecipe,
      user,
      // refRecipe: newExploreRecipe._id,
      _id: undefined
    };
    // console.log(copiedRecipeWithCurrUser);
    // let removedRecipe = this.state.global_recipes.splice(idx, 1);
    httpClient.newRecipe(copiedRecipeWithCurrUser).then((response) => {
      // console.log('copied new recipe',response);
      // this.setState({
      //   global_recipes: this.state.global_recipes
      // });
    }).catch((err) => console.log(err));
    // newExploreRecipe.followers.push(user._id)
    // httpClient.addUserToRecipeFollowers({
    //   ...newExploreRecipe,
    //   followers: newExploreRecipe.followers
    // }).then((response) => {
    //   console.log(response);
    // }).catch((err) => console.log(err));

  }

  renderIngredientList(ingredients) {
    if(ingredients !== null && ingredients.length > 0) {
      return ingredients.map((ingredient, idx) => {
        return (
          <li key={idx} class="c-ingredient">
            <span>{ingredient.name}</span>
            <span>{ingredient.quantity}</span>
          </li>
        )
      });
    }
    else return null;
  }

  renderInstructionsList(instructions) {
    if(instructions !== null && instructions.length > 0) {
      return instructions.map((instruction, idx) => {
        return (
          <li key={idx} class="c-instruction">
            <p>{instruction.name}</p>
          </li>
        );
      });
    }
    else return null;
  }

  // handleToggleRecipeDetail() {
  //   this.setState({
  //     recipeDetail: {
  //       ...this.state.recipeDetail,
  //       isActive: !this.state.recipeDetail.isActive,
  //       edit: false
  //     }
  //   });
  // }

}
