# Forms

- input validation
- JavaScript representation of the form

# Template driven vs Reactive

![Untitled](images/Untitled.png)

**Template** - Angular infers the Form Object from the DOM.

**Reactive** - Form is created programmatically and synchronized with the DOM.

# TD approach

### Creating forms

```tsx
// app.module.ts

import { FormsModules } from '@angular/forms'
```

```html
<!-- app.component.html -->

<form>
	<div id ="user-data">
		<div class="form-group">
			<input
				type="text"
				id="username"
				class="form-control"
				ngModel
				name="username"
			/>
		</div>
	</div>
</form>
```

By adding the `ngModel` and `name` we tell angular how to represent the input in JavaScript representation.

### Making the form submitable

Add the `(onSubmit)="onSubmit(f)"`:

```html
<!-- app.component.html -->

<form (ngSubmit)="onSubmit(f)">
</form>
```

How to get data? Add the `#f="ngForm"`

```html
<!-- app.component.html -->

<form (ngSubmit)="onSubmit(f)" #f="ngForm">
</form>
```

Now `onSubmit(f)` gets `NgForm` as parameter:

```tsx
// app.component.ts

onSubmit(form: NgForm) {
}
```

### Accessing the form with @ViewChild

```html
<!-- app.component.html -->

<form (ngSubmit)="onSubmit()" #f="ngForm">
</form>
```

`#f` is still a reference in our template, without passing it as argument:

```tsx
// app.component.ts

@ViewChild('f') signupForm: NgForm;

onSubmit() {
	console.log(this.signupForm);
}
```

So this gives us access to the very same form without passing it to `onSubmit`. This is especially useful if you need to access the form, not just at the point of time when you submit it.

## Form validation

Add `required` and `email` to input:

```html
<!-- app.component.html -->

<form>
	<div id ="user-data">
		<div class="form-group">
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
	</div>
</form>
```

The form has an attribute `valid` that we can check if the form is valid or not. Angular also dynamically adds some classes to input that tells us if the input is dirty, touched and valid.

Based on this classes we can style the inputs as we like.

### Using the Form state

We can use the state attributes directly from the reference.

```html
<!-- app.component.html -->

<button
	class="btn btn-primary"
	type="submit"
	[disabled]="!f.valid"
>
Submit
</button>
```

Add style to inputs to show invalid inputs:

```css
input.bg-invalid.ng-touched {
	border: 1px solid red;
}
```

Set red border only to inputs of the form, because form and divs in the form also get the `ng-invalid` class.

Use the `ng-touched` class to show invalid inputs only after the user has clicked on the input.

### Show warnings

```html
<!-- app.component.html -->

<form>
	<div id ="user-data">
		<div class="form-group">
			<input
				type="email"
				id="email"
				class="form-control"
				ngModel
				name="email"
				required
				email
				#email="ngModel"
			>
			<span 
				class="help-block" 
				*ngIf="email.valid && email.touched"
			>
					Please enter a valid email!
			<span>
		</div>
	</div>
</form>
```

## Default values with `ngModel`

You can use one-way binding property binding to set a default value.

```tsx
// app.component.ts

defaultQuestion = 'teacher'
```

```html
<!-- app.component.html -->

<div class="form-group">
          <label for="secret">Secret Questions</label>
          <select
            id="secret"
            class="form-control"
            [ngModel]="defaultQuestion"
            name="secret"
					>
            <option value="pet">Your first Pet?</option>
            <option value="teacher">Your first teacher?</option>
          </select>
        </div>
```

## Using `ngModel` with Two-Way binding

Two-way binding is still possible:

```html
<!-- app.component.html -->

<div class="form-group">
          <label for="secret">Secret Questions</label>
          <select
            id="secret"
            class="form-control"
            [ngModel]="defaultQuestion"
            name="secret"
					>
            <option value="pet">Your first Pet?</option>
            <option value="teacher">Your first teacher?</option>
          </select>
        </div>
        <div class="form-group">
          <textarea
            name="questionAnswer"
            rows="3"
            class="form-control"
            [(ngModel)]="answer"></textarea>
        </div>
				<p>Your reply: {{ answer }}</p>
```

We saw all three forms:

- No binding, to just tell Angular that an input is a control,
- one-way binding to give that control a default value and
- two-way binding to instantly output it or do whatever you want to do with that value.

## Grouping Form Controls

Add `ngModelGroup`:

```html
<!-- app.component.html -->

<div id="user-data" ngModelGroup="userData" #userData="ngModelGroup">
    <div class="form-group">
      <label for="username">Username</label>
      <input
        type="text"
        id="username"
        class="form-control"
        ngModel
        name="username"
        required>
</div>
<p *ngIf="!userData.valid && userData.touched">User data is invalid!</p>
```

This will add a `userData` to value of the form and `userData` control.

As soon as we click into one of the fields and then leave it, we’ll see the error message: “*User data is invalid!*”.

## Handling Radio Buttons

Add genders (***ONLY 2 GENDERS? TriGGeRED?!***) array to typescript:

```tsx
// app.component.ts

genders = ['male', 'female'];
```

Add radio button to html:

```html
<!-- app.component.html -->

<div class="radio" *ngFor="let gender of genders">
          <label>
            <input
              type="radio"
              name="gender"
              ngModel
              [value]="gender"
              required>
            {{ gender }}
          </label>
        </div>
```

If you want to set it to a default gender of course, you can use one-way binding again to make sure that one of the two buttons is selected by default at the start when you load the form. You can also of course add the required directive or attribute to that input here to make sure that now the form will not be valid until one of the two has been selected, so that works just like on any other input.

## Setting and patching form values

```tsx
// app.component.ts

suggestUserName() {
    const suggestedName = 'Superuser';
		
		// not the best approach - overwrites everything
    this.signupForm.setValue({
       userData: {
         username: suggestedName,
         email: ''
       },
       secret: 'pet',
       questionAnswer: '',
       gender: 'male'
    });

		// better approach - only overwrite specific
    this.signupForm.form.patchValue({
      userData: {
        username: suggestedName
      }
    });
  }
```

Add suggest username button:

```html
<!-- app.component.html -->

<button
	class="btn btn-default"
	type="button"
	(click)="suggestUserName()">
Suggest an username
</button>
```

## Using Form Data and resetting

```tsx
// app.component.ts

user = {
    username: '',
    email: '',
    secretQuestion: '',
    answer: '',
    gender: ''
};
submitted = false;

onSubmit() {
    this.submitted = true;
    this.user.username = this.signupForm.value.userData.username;
    this.user.email = this.signupForm.value.userData.email;
    this.user.secretQuestion = this.signupForm.value.secret;
    this.user.answer = this.signupForm.value.questionAnswer;
    this.user.gender = this.signupForm.value.gender;
		
		// It will also reset the state of the form.
    this.signupForm.reset();
}
```

```html
<!-- app.component.html -->

<div class="row" *ngIf="submitted">
    <div class="col-xs-12">
      <h3>Your Data</h3>
      <p>Username: {{ user.username }}</p>
      <p>Mail: {{ user.email }}</p>
      <p>Secret Question: Your first {{ user.secretQuestion }}</p>
      <p>Answer: {{ user.answer }}</p>
      <p>Gender: {{ user.gender }}</p>
    </div>
  </div
```

# Reactive approach

```tsx
import { ReactiveFormsModule } from '@angular/forms';
```

Form is created programmatically and synchronized with the DOM.

```tsx
// app.component.ts

export class AppComponent implements OnInit {
  genders = ['male', 'female'];
  signupForm: FormGroup;

  constructor() {}

  ngOnInit() {
    this.signupForm = new FormGroup({
      'username': new FormControl(null),
      'email': new FormControl(null),
      'gender': new FormControl('male')
    });
	}
}
```

### Syncing HTML and form

We add `[formGroup]`, `formControlName` to inputs.

```html
<!-- app.component.html -->

<form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            formControlName="username"
            class="form-control">
        </div>
        <div class="form-group">
          <label for="email">email</label>
          <input
            type="text"
            id="email"
            formControlName="email"
            class="form-control">
        </div>
        <div class="radio" *ngFor="let gender of genders">
          <label>
            <input
              type="radio"
              formControlName="gender"
              [value]="gender">{{ gender }}
          </label>
        </div>
        <button class="btn btn-primary" type="submit">Submit</button>
      </form>
```

## Adding the submit method

We add `(ngSubmit)="onSubmit()` to html and `onSubmit()` method to typescript:

```tsx
// app.component.ts

onSubmit() {
	console.log(this.signupForm);
}
```

## Validation

We need to specify validators in `FormControl`:

```tsx
// app.component.ts

ngOnInit() {
    this.signupForm = new FormGroup({
      'username': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email])
      'gender': new FormControl('male')
    });
}
```

## Accessing controls

We can use `signupForm.get()` to get the input and check it’s classes.

```html
<!-- app.component.html -->

<form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            formControlName="username"
            class="form-control">
          <span
            *ngIf="!signupForm.get('username').valid && signupForm.get('username').touched"
            class="help-block">Please enter a valid username!
          </span>
        </div>
        <div class="form-group">
          <label for="email">email</label>
          <input
            type="text"
            id="email"
            formControlName="email"
            class="form-control">
          <span
            *ngIf="!signupForm.get('email').valid && signupForm.get('email').touched"
            class="help-block">Please enter a valid email!</span>
        </div>
        <div class="radio" *ngFor="let gender of genders">
          <label>
            <input
              type="radio"
              formControlName="gender"
              [value]="gender">{{ gender }}
          </label>
        </div>
        <span
          *ngIf="!signupForm.valid && signupForm.touched"
          class="help-block">Please enter valid data!</span>
        <button class="btn btn-primary" type="submit">Submit</button>
      </form>
```

## Form group

Add form group in typescript programmatically:

```tsx
// app.component.ts

ngOnInit() {
    this.signupForm = new FormGroup({
      'userData': new FormGroup({
        'username': new FormControl(null, Validators.required),
        'email': new FormControl(null, [Validators.required, Validators.email])
      }),
      'gender': new FormControl('male')
    });
```

Add *div* with `formGroupName="userData"` and fix `signupForm.get()` methods.

```html
<!-- app.component.html -->

<form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
        <div formGroupName="userData">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              class="form-control">
            <span
              *ngIf="!signupForm.get('userData.username').valid && signupForm.get('userData.username').touched"
              class="help-block">
              Please enter a valid username!
            </span>
          </div>
          <div class="form-group">
            <label for="email">email</label>
            <input
              type="text"
              id="email"
              formControlName="email"
              class="form-control">
            <span
              *ngIf="!signupForm.get('userData.email').valid && signupForm.get('userData.email').touched"
              class="help-block">Please enter a valid email!</span>
          </div>
        </div>
        <div class="radio" *ngFor="let gender of genders">
          <label>
            <input
              type="radio"
              formControlName="gender"
              [value]="gender">{{ gender }}
          </label>
        </div>
        <span
          *ngIf="!signupForm.valid && signupForm.touched"
          class="help-block">Please enter valid data!</span>
        <button class="btn btn-primary" type="submit">Submit</button>
      </form>
```

## Arrays of form controls

Add the form array to html and `formArrayName="hobbies"` to connect it with control in typescript. Add `[formControlName]` to each of the hobby inputs with for loop.

```html
<!-- app.component.html -->

<div formArrayName="hobbies">
    <h4>Your Hobbies</h4>
    <button
      class="btn btn-default"
      type="button"
      (click)="onAddHobby()">Add Hobby</button>
    <div
      class="form-group"
      *ngFor="let hobbyControl of getControls(); let i = index">
      <input type="text" class="form-control" [formControlName]="i">
    </div>
		
		<!-- alternative -->
    <div
      class="form-group"
      *ngFor="let hobbyControl of controls; let i = index">
      <input type="text" class="form-control" [formControlName]="i">
    </div>
</div>

```

Add the form array to form in typescript and add the `onAddHobby()` and `getControls()` method.

```tsx
// app.component.ts

ngOnInit() {
  this.signupForm = new FormGroup({
    'userData': new FormGroup({
      'username': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email])
    }),
    'gender': new FormControl('male')
    'hobbies': new FormArray([])
  });
}

onAddHobby() {
  const control = new FormControl(null, Validators.required);
  (<FormArray>this.signupForm.get('hobbies')).push(control);
}

getControls() {
  return (<FormArray>this.signupForm.get('hobbies')).controls;
}

// alternative
get controls() {
  return (this.signupForm.get('hobbies') as FormArray).controls;
}
```

## Adding custom validators

```tsx
// app.component.ts

forbiddenUsernames = ['Chris', 'Anna'];

ngOnInit() {
  this.signupForm = new FormGroup({
    'userData': new FormGroup({
      'username': new FormControl(
					null, 
					[Validators.required, this.forbiddenNames.bind(this)]
			 ),
      'email': new FormControl(
					null,
					[Validators.required, Validators.email]
			 )
    }),
    'gender': new FormControl('male'),
    'hobbies': new FormArray([])
	});
}

// {[s: string]}: boolean = object(key - string value - boolean pair)
forbiddenNames(control: FormControl): {[s: string]: boolean} {
		// if we found username, it's invalid
    if (this.forbiddenUsernames.indexOf(control.value) !== -1) {
      return {'nameIsForbidden': true};
    }
		// If validation is successful return null or nothing
    return null;
```

## Using error codes

Add validation error message based on the error with `signupForm.get('userData.username').errors`:

```html
<!-- app.component.html -->

<div class="form-group">
    <label for="username">Username</label>
    <input
      type="text"
      id="username"
      formControlName="username"
      class="form-control">
    <span
      *ngIf="!signupForm.get('userData.username').valid && signupForm.get('userData.username').touched"
      class="help-block">
      <span *ngIf="signupForm.get('userData.username').errors['nameIsForbidden']">This name is invalid!</span>
    </span>
</div>
```

## Async validators

Create async validator and add it to `FormControl` as third parameter.

```tsx
// app.component.ts

ngOnInit() {
    this.signupForm = new FormGroup({
      'userData': new FormGroup({
        'username': new FormControl(
						null, 
						[Validators.required, this.forbiddenNames.bind(this)]
				),
        'email': new FormControl(
						null, 
						[Validators.required, Validators.email],
						this.forbiddenEmails
				)
      }),
      'gender': new FormControl('male'),
      'hobbies': new FormArray([])
    });
}

forbiddenEmails(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        if (control.value === 'test@test.com') {
          resolve({'emailIsForbidden': true});
        } else {
          resolve(null);
        }
      }, 1500);
    });
    return promise;
  }
```

Class of the input changes to `ng-pending` and then to `ng-invalid`.

## Reacting to status or value changes

```tsx
// app.component.ts

this.signupForm.valueChanges.subscribe(
    (value) => console.log(value)
);

this.signupForm.statusChanges.subscribe(
		(status) => console.log(status)
);
```

## Setting and patching values and resetting form

```tsx
// app.component.ts

// overwrites the whole form
this.signupForm.setValue({
      'userData': {
        'username': 'Max',
        'email': 'max@test.com'
      },
      'gender': 'male',
      'hobbies': []
});

// overwrites only the specific value
this.signupForm.patchValue({
  'userData': {
    'username': 'Anna',
  }
});

// resetting after submitting
onSubmit() {
  console.log(this.signupForm);
  this.signupForm.reset();
}
```