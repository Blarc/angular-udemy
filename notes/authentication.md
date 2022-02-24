# Authentication

- How to add authentication to Angular application
- how to lock down parts of the application or the entire application

![Untitled](images/auth.png)

.

## Authentication page

Add the page with login form.

```html
<!-- auth.component.html -->

<div class="row">
  <div class="col-xs-12 col-md-6 col-md-offset-3">
		<form #authForm="ngForm" (ngSubmit)="onSubmit(authForm)">
	    <div class="form-group">
	      <label for="email">E-Mail</label>
	      <input
	        type="email"
	        id="email"
	        class="form-control"
					ngModel
	        name="email"
	        required
	        email
	      />
	    </div>
	    <div class="form-group">
	      <label for="password">Password</label>
	      <input
	        type="password"
	        id="password"
	        class="form-control"
					ngModel
	        name="password"
	        required
	        minlength="6"
	      />
	    </div>
			<div>
	      <button
	        class="btn btn-primary"
					type="submit"
					[disabled]="!authForm.valid"
	      >
	        {{ isLoginMode ? 'Login' : 'Sign Up' }}
	      </button>
	      |
	      <button class="btn btn-primary" (click)="onSwitchMode()" type="button">
	        Switch to {{ isLoginMode ? 'Sign Up' : 'Login' }}
	      </button>
	    </div>
		</form>
  </div>
</div>
```

Enable switching between login and sign up modes and handle the form input.

```tsx
// auth.component.ts

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {
	isLoginMode = true;

	onSwitchMode() {
		this.isLoginMode = !this.isLoginMode;
	}

	onSubmit(form: NgForm) {
		console.log(form.value);
    form.reset();
  }
}
```

## Preparing the signup request

Create `AuthService` and add a `signup` method:

```tsx
// auth.service.ts

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}

	signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'server.com/signupNewUser?key=key123',
        {
          email: email,
          password: password,
          returnSecureToken: true
        }
      );
	}
}
```

## Sending the signup request

Call the `AuthService.signup` in the component:

```tsx
// auth.component.ts

error: string = null;

constructor(private authService: AuthService) {}

onSubmit(form: NgForm) {
	if (!form.valid) {
    return;
  }

  const email = form.value.email;
  const password = form.value.password;

	if (this.isLoginMode) {
		...
	}
	else {
		this.authService.signup(email, password).subscribe(
			resData => {
				console.log(resData);
			},
			error => {
				console.log(error),
			}
		);
	  form.reset();
	}
}
```

## Error handling

Add `pipe` with `catchError` to the `post` request:

```tsx
// auth.service.ts

signup(email: string, password: string) {
  return this.http
    .post<AuthResponseData>(
      'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyDb0xTaRAoxyCgvaDF3kk5VYOsTwB_3o7Y',
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    )
    .pipe(catchError(this.handleError))
	);
}

private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
}
```

## Sending a login request

```tsx
// auth.service.ts

login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'server.com/verifyPassword?key=key123',
        {
          email: email,
          password: password,
          returnSecureToken: true
        }
      )
      .pipe(catchError(this.handleError))
    );
  }
```

Use the created `login` method in component:

```tsx
// auth.component.ts

isLoginMode = true;
isLoading = false;
error: string = null;

constructor(private authService: AuthService) {}

onSubmit(form: NgForm) {
	if (!form.valid) {
    return;
  }

  const email = form.value.email;
  const password = form.value.password;

	let authObs: Observable<AuthResponseData>;
	this.isLoading = true;

	if (this.isLoginMode) {
    authObs = this.authService.login(email, password);
  } else {
    authObs = this.authService.signup(email, password);
  }

  authObs.subscribe(
    resData => {
      console.log(resData);
      this.isLoading = false;
      this.router.navigate(['/recipes']);
    },
    errorMessage => {
      console.log(errorMessage);
      this.error = errorMessage;
      this.isLoading = false;
    }
  );

  form.reset();
}
```

## Creating and storing user

Create a user model:

```tsx
// user.model.ts

export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date
  ) {}

	// Automatically check the validity of the token when you try to access it.
  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }
}
```

Store authenticated user in the `AuthService`:

```tsx
// auth.service.ts

user = new Subject<User>();

signup(email: string, password: string) {
  return this.http
    .post<AuthResponseData>(
      'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyDb0xTaRAoxyCgvaDF3kk5VYOsTwB_3o7Y',
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    )
		.pipe(
      catchError(this.handleError),
      tap(resData => {
        this.handleAuthentication(
          resData.email,
          resData.localId,
          resData.idToken,
          +resData.expiresIn
        );
      })
    );
}

// same for login

private handleAuthentication(
  email: string,
  userId: string,
  token: string,
  expiresIn: number
) {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, userId, token, expirationDate);
  this.user.next(user);
}
```

## Reflecting the authentication state in the UI

Add a logout button and set for which pages user needs to be authenticated:

```html
<li routerLinkActive="active" *ngIf="isAuthenticated">
  <a routerLink="/recipes">Recipes</a>
</li>
<li routerLinkActive="active" *ngIf="!isAuthenticated">
  <a routerLink="/auth">Authenticate</a>
</li>

...
<li *ngIf="isAuthenticated">
  <a style="cursor: pointer;" (click)="onLogout()">Logout</a>
</li>
<li class="dropdown" appDropdown *ngIf="isAuthenticated">
...
```

Add the `isAuthenticated`property to component and logic to change it:

```tsx
// header.component.ts

isAuthenticated = false;
private userSub: Subscription;

constructor(
    private dataStorageService: DataStorageService,
    private authService: AuthService
) {}

// If we have user, we are logged in
ngOnInit() {
  this.userSub = this.authService.user.subscribe(user => {
		// this.isAuthenticated = !user ? false : true;
    this.isAuthenticated = !!user;
  });
}
```

## Adding the token to outgoing requests

Use `BehaviourSubject` instead of `Subject` for user:

```tsx
// auth.service.ts

user = new BeahviourSubject<User>(null);
```

> **Behavior subject** gives subscribers immediate access to the previously emitted value even if they haven't subscribed at the point of time that value was emitted. That means we can get access to the currently active user even if we only subscribe after that user has been emitted. So this means when we fetch data and we need that token at this point of time, even if the user logged in before that point of time which will have been the case, we get access to that latest user.
> 

Get the user before fetching recipes and add the token:

```tsx
// data-storage.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, take, exhaustMap } from 'rxjs/operators';

fetchRecipes() {
	this.authService.user.pipe(
		take(1), 
		exhaustMap(user => {
		  return this.http
		    .get<Recipe[]>(
		      'https://ng-course-recipe-book-65f10.firebaseio.com/recipes.json',
					{
						params: new HttpParams().set('auth', user.token)
					}
			   )
		}),
    map(recipes => {
      return recipes.map(recipe => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        };
			};
    }),
    tap(recipes => {
      this.recipeService.setRecipes(recipes);
    })
  );
}
```

> **Take** is called as a function that accepts a number as parameter which tells RxJS is that we want to take one value from that observable and thereafter, it should automatically unsubscribe. This manages the subscription for us, gives us the latest user and unsubscribes
> 

> **ExhaustMap** waits for the first observable to complete. After that, it passes the data from that previous observable to a function and return a new observable which will then replace our previous observable in that entire observable chain.
> 

## Adding the token with interceptor

Use interceptor to add the token to every outgoing request when logged in:

```tsx
// auth-interceptor.service.ts

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
				// Only modify requests when logged in
        if (!user) {
          return next.handle(req);
        }
        const modifiedReq = req.clone({
          params: new HttpParams().set('auth', user.token)
        });
        return next.handle(modifiedReq);
      })
    );
  }
}
```

And add it to providers in `app.module.ts`:

```tsx
// app.module.ts

...
providers: [
  ShoppingListService,
  RecipeService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true
  }
],
...
```

## Adding logout

Add a `logout` method in `AuthService`and use it in the header component:

```tsx
// auth.service.ts

// Inject router
constructor(private http: HttpClient, private router: Router) {}

logout() {
  this.user.next(null);
  this.router.navigate(['/auth']);
}
```

## Auto-Login and Auto-Logout

We have to store token in persistence storage - cookies or local storage.

```tsx
// auth.service.ts

private tokenExpirationTimer: any;

private handleAuthentication(
  email: string,
  userId: string,
  token: string,
  expiresIn: number
) {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, userId, token, expirationDate);
  this.user.next(user);
	this.autoLogout(expiresIn * 1000);
	localStorage.setItem('userData', JSON.stringify(user));
}

autoLogin() {
  const userData: {
    email: string;
    id: string;
    _token: string;
    _tokenExpirationDate: string;
  } = JSON.parse(localStorage.getItem('userData'));
  if (!userData) {
    return;
  }

	const loadedUser = new User(
    userData.email,
    userData.id,
    userData._token,
    new Date(userData._tokenExpirationDate)
  );

  if (loadedUser.token) {
    this.user.next(loadedUser);
    const expirationDuration =
      new Date(userData._tokenExpirationDate).getTime() -
      new Date().getTime();
	  this.autoLogout(expirationDuration);
	}
}

logout() {
  this.user.next(null);
  this.router.navigate(['/auth']);
	localStorage.removeItem('userData');
	if (this.tokenExpirationTimer) {
    clearTimeout(this.tokenExpirationTimer);
  }
  this.tokenExpirationTimer = null;
}

autoLogout(expirationDuration: number) {
  this.tokenExpirationTimer = setTimeout(() => {
    this.logout();
  }, expirationDuration);
}
```

Add `autoLogin` to `AppComponent`:

```tsx
// app.component.ts

// Inject AuthService
constructor(private authService: AuthService) {}

// Try to log in on init
ngOnInit() {
  this.authService.autoLogin();
}
```

## Adding an Auth Guard

Add a `AuthGuard` class that implements `CanActivate`:

```tsx
// auth.guard.ts

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

	// Inject AuthService and Router
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Promise<boolean | UrlTree>
    | Observable<boolean | UrlTree> {
    return this.authService.user.pipe(
      take(1),  // ! Make sure we always take just the latest user value 
      map(user => {
        const isAuth = !!user;
        if (isAuth) {
          return true;
        }
        return this.router.createUrlTree(['/auth']);
      })
      // tap(isAuth => {
      //   if (!isAuth) {
      //     this.router.navigate(['/auth']);
      //   }
      // })
    );
  }
}
```

Add the `AuthGuard` to the recipes path in `AppRoutingModule`:

```tsx
// app-routing.module.ts

...
path: 'recipes',
component: RecipesComponent,
canActivate: [AuthGuard],
...
```