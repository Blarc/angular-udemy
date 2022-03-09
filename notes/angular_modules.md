# Angular Modules & Optimizing Angular Apps

Modules are a way of bundling Angular building blocks together (components, directives, services, pipes).

![Untitled](images/Untitled%207.png)

## Feature modules

![Untitled](images/Untitled%201.png)

Create `RecipesModules` and add the needed modules to `imports`:

```tsx
// recipes.module.ts

@NgModule({
  declarations: [
    RecipesComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeItemComponent,
    RecipeStartComponent,
    RecipeEditComponent
  ],
	imports: [
		RouterModule,
		CommonModule, // BrowserModule can be imported just once
		ReactiveFormsModule
	]
	exports: [
		RecipesComponent,
		RecipeListComponent,
		RecipeDetailComponent,
		RecipeItemComponent,
		RecipeStartComponent,
		RecipeEditComponent,
	]
})
export class RecipesModule {}
```

Add the recipe module to `AppModule` and remove unnecessary declarations:

```tsx
// app.module.ts

@NgModule({
	declarations: [
		AppComponent, HeaderComponent
	],
  imports: [
		...
    RecipesModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

> Whatever you use in the templates of components, has to be **imported** in that module. It is not enough if you import it in the app module. The only exception to the rule are **services**, These only need to be set up once in the app module and you can access them in your whole application, even in components which you added to feature modules but anything that's used in a template (components, directives, pipes) need to be declared or imported into the module where you plan on using them. It's not enough to use them in another module, even if you export your things to that other module. Angular treats and parses every NgModule standalone.
> 

## Adding routes to feature modules

In a feature module which you then plan on importing into your app module, you would use `forChild` and this will automatically merge the child routing configuration with the root routes.

```tsx
// recipes.module.ts

@NgModule({
	...
	imports: [
		// RouterModule.forChild(//pass all the routes),
		RecipesRoutingModule,
		CommonModule, // BrowserModule can be imported just once
		ReactiveFormsModule
	]
	...
})
export class RecipesModule {}
```

Or you can add a separate routing module for recipes:

```tsx
// recipes-routing.module.ts

const routes: Routes = [
  {
    path: '',
    component: RecipesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: RecipeStartComponent },
      { path: 'new', component: RecipeEditComponent },
      {
        path: ':id',
        component: RecipeDetailComponent,
        resolve: [RecipesResolverService]
      },
      {
        path: ':id/edit',
        component: RecipeEditComponent,
        resolve: [RecipesResolverService]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecipesRoutingModule {}
```

## Component declarations

Now that we manage the loading of our components with recipes routing there is no reason to still export recipe components because we're now only using them internally in the recipes module. We're using them either embedded into other components or by loading them through the recipes routing module, both is part of the same file. 

```tsx
// recipes.module.ts

@NgModule({
  declarations: [
    RecipesComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeItemComponent,
    RecipeStartComponent,
    RecipeEditComponent
  ],
	imports: [
		RouterModule,
		CommonModule, // BrowserModule can be imported just once
		ReactiveFormsModule,
		RecipesRoutingModule
	]
	// exports removed
})
export class RecipesModule {}
```

## Shared module

The two modules only differ in one component. All the other components and directives they use are essentially the same. We can put such shared components, directives and other modules into a shared module.

![Untitled](images/Untitled%202.png)

Create a shared module:

```tsx
// shared.module.ts

@NgModule({
  declarations: [
    AlertComponent,
    LoadingSpinnerComponent,
    PlaceholderDirective,
    DropdownDirective
  ],
  imports: [CommonModule],
  exports: [
    AlertComponent,
    LoadingSpinnerComponent,
    PlaceholderDirective,
    DropdownDirective,
    CommonModule
  ],
  entryComponents: [AlertComponent],
  providers: [LoggingService]
})
export class SharedModule {}
```

Add the shared module in recipes module:

```tsx
// recipes.module.ts

@NgModule({
  declarations: [
    RecipesComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeItemComponent,
    RecipeStartComponent,
    RecipeEditComponent
  ],
	imports: [
		RouterModule,
		SharedModule, // Replace CommonModule with SharedModule
		ReactiveFormsModule,
		RecipesRoutingModule
	]
	// exports removed
})
export class RecipesModule {}
```

> You can only declare components, directives and pipes once. You can't declare them multiple times. You can import a module into multiple times but you can’t declare it multiple times.
> 

Remove duplicated declarations from `AppModule` and add them to `SharedModules`, then add the `SharedModule` to `AppModule`.

## Core module

For making `AppModule` a bit leaner.

![Untitled](images/Untitled%203.png)

Add `CoreModule`:

```tsx
// core.module.ts

@NgModule({
  providers: [
    ShoppingListService,
    RecipeService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ]
})
export class CoreModule {}
```

And add the `CoreModule` to imports in `AppModule`:

```tsx
// app.module.ts

@NgModule({
  declarations: [AppComponent, HeaderComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    CoreModule // added here
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

# Lazy loading

Lazy loading is optimization concept. Only load the code that you need. 

![Untitled](images/Untitled%204.png)

> With lazy loading we initially only load our root route content, so only the app module code and the code of all the components that are registered there and we don't load the other modules. Advantage of this is that initially, we download a smaller code bundle and we download more code when we need it. But initially our app is able to start faster because it has to download and parse less code on the first visit of a certain route and that's the advantage.
> 

## Implementing lazy loading

```tsx
// app-routing.module.ts

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const appRoutes: Routes = [
  { path: "", redirectTo: "/recipes", pathMatch: "full" },
  {
    path: "recipes",
		// this is old and might fail
    loadChildren: "./recipes/recipes.module.ts#RecipesModule"
  },
  {
    path: "shopping-list",
    loadChildren: () =>
      import("./shopping-list/shopping-list.module").then(
        m => m.ShoppingListModule
      )
  },
  {
    path: "auth",
    loadChildren: () => 
			import("./auth/auth.module").then(
				m => m.AuthModule
			)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

To have the biggest effect and save the most code, make sure your imports at the top are correct.

## Preloading lazy-loaded code

```tsx
// app-routing.module.ts

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules )],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

> The advantage is that the initial download bundles still is kept small because there that code is not included and therefore the initial loading phase is fast, but then when the user is browsing the page and we have some idle time, we preload these additional code bundles to make sure that subsequent navigation requests are faster. This way we're getting the best of both worlds: a **fast initial load** and thereafter, **fast subsequent loads**.
> 

<aside>
💡 You can build your own preloading strategies.

</aside>

## Services & Modules

When services are available and when they are not.

![Untitled](images/Untitled%205.png)

## Loading services differently

```tsx
// logging.service.ts

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' }) // same instance for the whole app
export class LoggingService {
  lastlog: string;

  printLog(message: string) {
    console.log(message);
    console.log(this.lastlog);
    this.lastlog = message;
  }
}
```

```tsx
// app.module.ts

// comment out import { Injectable } from '@angular/core'; in logging service.ts

providers: [LogginService]

// Still same instance for the whole app
```

```tsx
// core.module.ts

providers: [LogginService]

// Still same instance for the whole app, because it's eagerly loaded to app.module.ts
```

```tsx
// shopping-list-module.ts

providers: [LogginService]

// Two different instances, one in app.module.ts and one in shopping-list-module.ts,
// shopping-list-module.ts is lazily loaded

```

```tsx
// shared.module.ts

providers: [LogginService]

// Shared module is also provided in shopping list module (lazy) and in app module (eagerly)
// Two instances... same as before

```

> So whilst providing a service directly in the lazy loaded module might be something you control deliberately, providing it in a shared module is a common gotcha where you think you use the same service instance in the entire app when you don't.
> 

## Ahead-of-Time Compilation

![Untitled](images/Untitled%206.png)

### Just in time

> So the entire code that is just responsible for compiling or templates is not that small. It's actually quite large and it's part of your angular application, even though it has no purpose, it has nothing to do with your business logic other than bringing it onto the screen, which arguably is important, but still a bit annoying that it has to be part of your application. The good thing is it doesn't have to be part of your application since the angular compiler is responsible for converting your template code into your template.
> 

### Ahead of time

> Since the angular compiler is responsible for converting your template code into a JavaScript commands that the browser understands we can do that during development as part of the build process.
> 

```bash
ng build --prod
```

This generates a build folder with bundled and optimized code.