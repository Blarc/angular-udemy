# Making HTTP requests

- How Angular communicates with a back-end, with a database and so on.
- How to send HTTP requests and also how to transform data if you need to.

## Sending a POST request

Add `HttpClientModule`:

```tsx
// app.module.ts

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

...
imports: [BrowserModule, FormsModule, HttpClientModule]
...
```

Inject `HttpClient` and use it in the method:

```tsx
// app.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loadedPosts: Post[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  onCreatePost(postData: { title: string; content: string }) {
    // Send Http request
    this.http.post(
			'url-to-backend.com/posts.json',
			 postData
		).subscribe(responseData => {
			console.log(responseData);
		});
  }
}
```

`postData` gets automatically transformed to JSON by Angular. `post` method returns *observable* that needs to be subscribed in order to send the request.

## Creating a GET request

```tsx
// app.module.ts

private fetchPosts() {
	this.http
		.get('url-to-backend.com/posts.json')
		.subscribe(posts => {
				console.log(posts);
		});
}
```

The data that was returned however, has to be transformed into a proper object. We can do that by using transform functions provided by observables:

```tsx
// app.component.ts

loadedPosts = [];

private fetchPosts() {
	this.http
		.get<{ [key: string]: Post }>('url-to-backend.com/posts.json')
		.pipe(map(responseData => {
			const postsArray: Post[] = [];
			for (const key in responseData) {
				if (responseData.hasOwnProperty(key)) {
					postsArray.push({...responseData[key], id: key});
				}
			}
			return postsArray;
		}))
		.subscribe(posts => {
				**this.loadedPosts = posts;
		});
}
```

We can set the type of the data we are fetching with `.get<{ [key: string]: Post }>`.

## Showing posts and loading indicator

Add `this.isFetching` to `fetchPosts()` method:

```tsx
// app.component.ts

loadedPosts = [];

private fetchPosts() {
	this.isFetching = true;
	this.http
		.get<{ [key: string]: Post }>('url-to-backend.com/posts.json')
		.pipe(map(responseData => {
			const postsArray: Post[] = [];
			for (const key in responseData) {
				if (responseData.hasOwnProperty(key)) {
					postsArray.push({...responseData[key], id: key});
				}
			}
			return postsArray;
		}))
		.subscribe(posts => {
				**this.loadedPosts = posts;
				this.isFetching = false;
		});
}
```

Use the `loadedPosts` and `isFetching` property in template:

```html
<div class="row">
    <div class="col-xs-12 col-md-6 col-md-offset-3">
      <p *ngIf="loadedPosts.length < 1 && !isFetching">No posts available!</p>
      <ul class="list-group" *ngIf="loadedPosts.length >= 1 && !isFetching">
        <li class="list-group-item" *ngFor="let post of loadedPosts">
          <h3>{{ post.title }}</h3>
          <p>{{ post.content }}</p>
        </li>
      </ul>
      <p *ngIf="isFetching">Loading...</p
    </div>
  </div>
```

## Using a service for http requests

Move the the code responsible for communication with the backend server to a service class.

```tsx
// posts.service.ts

@Injectable({ providedIn: 'root' })
export class PostsService {
  error = new Subject<string>();

  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title: title, content: content };
    this.http
      .post<{ name: string }>('server.com/posts.json', postData)
      .subscribe(
        responseData => {
          console.log(responseData);
        }
      );
  }

	fetchPosts() {
	  let searchParams = new HttpParams();
	  searchParams = searchParams.append('print', 'pretty');
	  searchParams = searchParams.append('custom', 'key');
	    return this.http
	    .get<{ [key: string]: Post }>('server.com/posts.json')
	    .pipe(
	      map(responseData => {
	        const postsArray: Post[] = [];
	        for (const key in responseData) {
	          if (responseData.hasOwnProperty(key)) {
	            postsArray.push({ ...responseData[key], id: key });
	          }
	        }
	        return postsArray;
	      })
	    );
	  }
}
```

Use the service by injecting it in the component:

```tsx
// app.component.ts

loadedPosts: Post[] = [];
isFetching = false;

constructor(private http: HttpClient, private postsService: PostsService) {}

ngOnInit() {
  this.isFetching = true;
  this.postsService.fetchPosts().subscribe(
    posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    }
  );
}

onCreatePost(postData: Post) {
  // Send Http request
  this.postsService.createAndStorePost(postData.title, postData.content);
}

onFetchPosts() {
  // Send Http request
  this.isFetching = true;
  this.postsService.fetchPosts().subscribe(
    posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    }
  );
```

## Sending a DELETE request

Send the request and subscribe to it in the component.

```tsx
// posts.service.ts

deletePosts() {
  return this.http.delete('server.com/posts.json');
}
```

After deleting the posts, update the list.

```tsx
// app.component.ts

onClearPosts() {
  // Send Http request
  this.postsService.deletePosts().subscribe(() => {
    this.loadedPosts = [];
  });
}
```

## Handling errors

Add the error arrow function as parameter to subscribe function:

```tsx
// app.component.ts

error = null;

onFetchPosts() {
  // Send Http request
  this.isFetching = true;
  this.postsService.fetchPosts().subscribe(
    posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    },
    error => {
      this.isFetching = false;
      this.error = error.message;
      console.log(error);
    }
  );
}
```

Use the `error` property to show an error message in the template:

```html
<p *ngIf="isFetching && !error">Loading...</p>
<div class="alert alert-danger" *ngIf="error">
  <h1>An Error Occurred!</h1>
  <p>{{ error }}</p>
</div>
```

## Using subject for error handling

Add an error subject to service...

```tsx
// posts.service.ts

error = new Subject<string>();

createAndStorePost(title: string, content: string) {
  const postData: Post = { title: title, content: content };
  this.http
    .post<{ name: string }>('server.com/posts.json', postData)
    .subscribe(
      responseData => {
        console.log(responseData);
      },
      error => {
        this.error.next(error.message);
      }
    );
}
```

...and subscribe to it wherever it’s necessary.

```tsx
// app.component.ts

private errorSub: Subscription;

ngOnInit() {
	this.errorSub = this.postsService.error.subscribe(errorMessage => {
	    this.error = errorMessage;
	});
}

// don't forget to unsubscribe
ngOnDestroy() {
  this.errorSub.unsubscribe();
}
```

## Using catchError operator

For creating a custom error or sending the error data to analytics server.

```tsx
// posts.service.ts
import { Subject, throwError } from 'rxjs';

fetchPosts() {
  let searchParams = new HttpParams();
  searchParams = searchParams.append('print', 'pretty');
  searchParams = searchParams.append('custom', 'key');
  return this.http
    .get<{ [key: string]: Post }>('server.com/posts.json')
    .pipe(
      map(responseData => {
        const postsArray: Post[] = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
            postsArray.push({ ...responseData[key], id: key });
          }
        }
        return postsArray;
      }),
			catchError(errorRes => {
        // Send to analytics server
        return throwError(errorRes);
      })
  );
}
```

## Headers, query parameters and response type

Add them as parameter to the http method.

```tsx
// posts.service.ts

return this.http
  .get<{ [key: string]: Post }>(
    'https://ng-complete-guide-c56d3.firebaseio.com/posts.json',
    {
      headers: new HttpHeaders({ 'Custom-Header': 'Hello' }),
			params: new HttpParams().set('print', 'pretty'),
			responseType: 'json' // automatically convert to json object; default value
    }
)

// OR

let searchParams = new HttpParams();
searchParams = searchParams.append('print', 'pretty');
searchParams = searchParams.append('custom', 'key');

return this.http
  .get<{ [key: string]: Post }>(
    'https://ng-complete-guide-c56d3.firebaseio.com/posts.json',
    {
      headers: new HttpHeaders({ 'Custom-Header': 'Hello' }),
      params: searchParams,
      responseType: 'json'
    }
)
```

## Observing different types of responses

```tsx
// posts.service.ts

createAndStorePost(title: string, content: string) {
  const postData: Post = { title: title, content: content };
  this.http
    .post<{ name: string }>(
      'https://ng-complete-guide-c56d3.firebaseio.com/posts.json',
      postData,
      {
        observe: 'response' // default is 'body'
      }
    )
    .subscribe(
      responseData => {
        console.log(responseData.body); // now returns response and not body
      },
      error => {
        this.error.next(error.message);
      }
	  );
}

deletePosts() {
  return this.http
    .delete('https://ng-complete-guide-c56d3.firebaseio.com/posts.json', {
      observe: 'events',
      responseType: 'text' // don't convert to json
    })
    .pipe(
      tap(event => {
        console.log(event);
        if (event.type === HttpEventType.Sent) {
          // ...
        }
        if (event.type === HttpEventType.Response) {
          console.log(event.body);
        }
      })
    );
}
```

Use **events** if you need very fine grained control.

## Interceptors

Imagine we want to authenticate our user and need to add a certain parameter or a certain header to every outgoing request. You don't want to manually configure every request because that is very cumbersome and for that, you can add interceptors.

```tsx
// auth-interceptor.service.ts

import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from '@angular/common/http';

export class AuthInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
		// req is immutable, that's why we need to clone it
    const modifiedRequest = req.clone({
      headers: req.headers.append('Auth', 'xyz')
    });
    return next.handle(modifiedRequest);
  }
}
```

We need to add the interceptor to `app.module.ts` as http interceptor:

```tsx
// app.module.ts

...
import { AuthInterceptorService } from './auth-interceptor.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

You're also not limited to interacting with the request in an interceptor, you can also interact with the response.

```tsx
// logging-interceptor.ts

import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEventType
} from '@angular/common/http';
import { tap } from 'rxjs/operators';

export class LoggingInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('Outgoing request');
    console.log(req.url);
    console.log(req.headers);
    return next.handle(req).pipe(
      tap(event => {
        if (event.type === HttpEventType.Response) {
          console.log('Incoming response');
          console.log(event.body);
        }
      })
    );
  }
}
```

In the interceptor you always get an event so you have the most granular access to the response you could possibly have.

```tsx
// app.module.ts

import { AuthInterceptorService } from './auth-interceptor.service';
import { LoggingInterceptorService } from './logging-interceptor.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

The **order** in which you **provide** them will also be the order in which they are **executed**.