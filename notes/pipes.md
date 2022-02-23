# Pipes

Transform output in your template without changing the property in TypeScript.

```html
<!-- app.component.html -->

<li class="list-group-item"
    *ngFor="let server of servers"
    [ngClass]="getStatusClasses(server)">
    <span class="badge">
    {{ server.status }}
    </span>
    <strong>{{ server.name }}</strong> |
    {{ server.instanceType | uppercase }} | <!-- add uppercase pipe -->
    {{ server.started | date }}             <!-- add date pipe -->
</li>
```

## How to configure pipes?

We can parameterize pipes.

```html
<!-- app.component.html -->

<li class="list-group-item"
    *ngFor="let server of servers"
    [ngClass]="getStatusClasses(server)">
    <span class="badge">
    {{ server.status }}
    </span>
    <strong>{{ server.name }}</strong> |
    {{ server.instanceType | uppercase }} |
    {{ server.started | date:'fullDate' }}  <!-- add date parameter -->
</li>
```

Multiple parameters are separated by colons.

## Combining pipes

We can chain pipes. **Order** might be important.

```html
<!-- app.component.html -->

<li class="list-group-item"
    *ngFor="let server of servers"
    [ngClass]="getStatusClasses(server)">
    <span class="badge">
    {{ server.status }}
    </span>
    <strong>{{ server.name }}</strong> |
    {{ server.instanceType | uppercase }} |
    {{ server.started | date:'fullDate' | uppercase }}  <!-- add uppercase pipe -->
</li>
```

## Creating custom pipes

Creating a pipe that shortens the input:

```tsx
// shorten.pipe.ts

// 1. import PipeTransform
import { Pipe, PipeTransform } from '@angular/core';

// 2. Add the decorator with pipe's name
@Pipe({
  name: 'shorten'
})
export class ShortenPipe implements PipeTransform {
	// 3. implement the transform method
  transform(value: any, limit: number) {
    if (value.length > limit) {
      return value.substr(0, limit) + ' ...';
    }
    return value;
  }
}
```

Add the created pipe to `app.module.ts`:

```tsx
// app.module.ts
...
import { ShortenPipe } from './shorten.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ShortenPipe,    // this was added
    FilterPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Use the pipe in the template:

```html
<!-- app.component.html -->

<li class="list-group-item"
    *ngFor="let server of servers"
    [ngClass]="getStatusClasses(server)">
    <span class="badge">
    {{ server.status }}
    </span>
    <strong>{{ server.name | shorten:10 }}</strong> |
    {{ server.instanceType | uppercase }} |
    {{ server.started | date:'fullDate' | uppercase }}  <!-- add uppercase pipe -->
</li>
```

## Filter pipe

Create a new pipe with CLI: `ng g p filter`. This also adds the pipe to `app.module.ts`.

```tsx
// filter.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, filterString: string, propName: string): any {
    if (value.length === 0 || filterString === '') {
      return value;
    }
    const resultArray = [];
    for (const item of value) {
      if (item[propName] === filterString) {
        resultArray.push(item);
      }
    }
    return resultArray;
  }
}
```

Add `filteredStatus` property to `app.component.ts`:

```tsx
// app.component.ts

filteredStatus = '';
```

Add the `filteredStatus` and use the pipe with `ngFor`:

```html
<!-- app.component.html -->

<input type="text" [(ngModel)]="filteredStatus">
<ul class="list-group">
    <li class="list-group-item"
	      *ngFor="let server of servers | filter:filteredStatus:'status'"
	      [ngClass]="getStatusClasses(server)">
	      <span class="badge">
	        {{ server.status }}
	      </span>
	      <strong>{{ server.name | shorten:10 }}</strong> |
	      {{ server.instanceType | uppercase }} |
	      {{ server.started | date:'fullDate' | uppercase }}
    </li>
</ul>
```

## Pure and impure pipes

Changing the data does **not** trigger the pipe, because it might lead to performance issues.

```html
<!-- app.component.html -->

<button class="btn btn-primary" (click)="onAddServer()">Add Server</button>
```

```tsx
// app.component.ts

onAddServer() {
    this.servers.push({
      instanceType: 'small',
      name: 'New Server',
      status: 'stable',
      started: new Date(15, 1, 2017)
    });
  }
```

To trigger it on data changes, we add `pure: false` to create an impure pipe:

```tsx
// filter.pipe.ts

@Pipe({
  name: 'filter',
  pure: false
})
```

## Understanding the “async” pipe

```tsx
// filter.pipe.ts

appStatus = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('stable');
    }, 2000);
  });
```

```html
<!-- app.component.html -->

<h2>App Status: {{ appStatus | async}}</h2>
```

Async recognizes it’s a promise or observable and after the data is resolved it will print the data to the screen.