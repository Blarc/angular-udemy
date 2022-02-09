import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Recipe } from "../recipe.model";

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  @Output()
  recipeWasSelected = new EventEmitter<Recipe>();

  recipes: Recipe[] = [
    new Recipe('A Test Recipe', 'This is simply a test', 'https://www.giallozafferano.com/images/228-22832/spaghetti-with-tomato-sauce_1200x800.jpg'),
    new Recipe('Another Test Recipe', 'This is simply a test', 'https://www.giallozafferano.com/images/228-22832/spaghetti-with-tomato-sauce_1200x800.jpg')
  ];

  constructor() { }

  ngOnInit(): void {
  }

  onRecipeSelected(recipeElement: Recipe) {
    this.recipeWasSelected.emit(recipeElement);
  }
}
