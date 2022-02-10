import {Recipe} from './recipe.model';
import {EventEmitter, Injectable} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService {
  recipeSelected = new EventEmitter<Recipe>();

  private recipes: Recipe[] = [
    new Recipe(
      'A Test Recipe',
      'This is simply a test',
      'https://www.giallozafferano.com/images/228-22832/spaghetti-with-tomato-sauce_1200x800.jpg',
      [
        new Ingredient('Meat', 1),
        new Ingredient('French Fries', 20)
      ]
    ),
    new Recipe(
      'Another Test Recipe',
      'This is simply a test',
      'https://www.giallozafferano.com/images/228-22832/spaghetti-with-tomato-sauce_1200x800.jpg',
      [
        new Ingredient('Spaghetti', 230),
        new Ingredient('Tomato sauce', 1)
      ])
  ];

  constructor(private slService: ShoppingListService) {
  }

  getRecipes() {
    // Returns a copy of the array
    return this.recipes.slice();
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }
}
