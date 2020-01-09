This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

## Infinite Scroller

- Would be loading 10K+ records asynchronously
- Keeping data in memory - could be redux / custom state management tool

### TODO:

- TDD development
- clean interface to integrate with Redux
- draggable and droppable
- after the drag, should question remain in the list or removed completely or there should be change in font color to show it was alreay added

> Collapsible - List
>
> - should be able to return plane list element or a grouped list element
>
> List - Runway
>
> - capture onScroll events and make it infinite scrollable
> - use transforms to move elements - not operation heavy for the browsers
>   - evt.nativeEvent.target.scrollHeight - the total length the scroller will cover
>   - evt.nativeEvent.target.scrollTop - the length cover so far
>   - evt.nativeEvent.target.clientHeight - height of the element which has the scroller

## TODO: - 1

.How to get the right group ID for the groups
.Devise a method to get the groups in the right order
.Filter the groups and mantain them in a state
.Use higher order components to create filtered Groups Permutation
.A Group should comunicate its view state through state management

- [x] Runway component should be transparent to groups and rows
      .Rows should be wrapped by a wrapper provided by Runway
      . This wrapper will carry translation details
      .Right way to calculate (row-height) Independent of (scroll-height, scroll-top, clientHeight)
      .would have to use `Sentinel` element to keep pushing the height of the Runway
- [x] USE TRANSLATE-Y to move elements
      .

## How to React

- Components should be resilient to rendering less or more often because otherwise they’re too coupled to their particular parents
- To stress-test your component, you can temporarily add this code to its parent

```JS
componentDidMount() {
  // Don't forget to remove this immediately!
  setInterval(() => this.forceUpdate(), 100);
}
```

## Also

- Does your app still behave as expected? Or do you see strange crashes and errors? It’s a good idea to do this stress test on complex components once in a while, and ensure that multiple copies of them don’t conflict with one another.

```JS
ReactDOM.render(
  <>
    <MyApp />
    <MyApp />
  </>,
  document.getElementById('root')
);

```

> These patterns are good indicators of where our components are fragile. Showing or hiding a tree shouldn’t break components outside of that tree
>
> If you’re not sure whether some state is local, ask yourself: “If this component was rendered twice, should this interaction reflect in the other copy?” Whenever the answer is “no”, you found some local state.

{/_onChange={evt => {
if (evt.target.value.length > 5) {
this.fireEvent({
eventName: events.search,
payload: evt.target.value
});
} else {
this.setState({
searchString: evt.target.value
});
}
}}_/}
