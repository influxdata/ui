# Visualizations

At it's core, most of our visualizations, and by extension most of our application, take a persisted representation (ViewProperties, fetched _somehow_) and some means of querying the database (FluxResults, fetched _somehow_), mix in some default values, then transform the data into a format that giraffe can understand. Unfortunatly, this representation was not mirrored in the code. So by taking a strong stance that the interface amongst visualization types should be universal, and working backwards from there, we find ourself with the implementation here. Externally, the `src/visualization` module exports four key defintions:

- `View`: This component is used to display the visualization. it takes ViewProperties and FluxResults (along with some other stuff like `theme` for now), transforms those into something giraffe can understand, and spits out a visualization.
- `ViewOptions`: This component will present the user with the options required to manipulate the particular details about a visualization type. it takes in ViewProperties and an update function that will mutate the visualizations view properties.
- `ViewTypeDropdown`: Here we expose a component that will let the user switch between the different visualization types.
- `SUPPORTED_VISUALIZATIONS`: This magic object is built at compile time from all of the type definitions found inside of `src/visualization/types`. The top three components cover most of the use cases within our application, but if we ever need lower level access or to extend functionality, this contains all of the information about a type definition.

### Type defintions

We have a lot of different types of visualizations that we support within the application. Their definitions were spread out across the codebase and had tight coupling to each other through both explicit means (sharing components between them that looked similar, but weren't logically grouped) or implicit means (expecting certain redux states to be initialized, even in contexts that didn't support them). This led to a change in one visualization type unknowingly breaking another, and limited the code's reuse in new contexts. I shudder at the risk and complexity of removing a visualization type from the interface. To bring their defintions all together into one place, and to untangle their interdependancies, an interface was created to help encourage better encapsulation. All that is required to add a new visualization type is to create a folder within `src/visualization/types`, and within it, create an `index.tsx` file that has a default export of a function that looks like this:

```Typescript
export default (register) => {
    register({
        // ... option defintion of Visualization
    })
}
```

Webpack will search for these `index.tsx` files on compilation, and call their default export with a registration function. This registration function adds the type defintion to the `SUPPORTED_VISUALIZATIONS` object, which is then used by the `View`, `ViewOptions`, and `ViewTypeDropdown` components to inform them on how they should behave given a particular ViewProperties defintion. The `Visualization` interface is documented with comments in it's TypeScript defintion, but in a longer form, the options for the registration configuration object are:

- `type` (_required_): a string that connects this defintion to it's ViewProperties type. For example, a XY graph has the type of `xy`. This field is what the exported components use to power their polymorphism.
- `disabled` (_optional_): if set to `true`, the ability to select the visualization type disappears from the `ViewTypeDropdown`. When using this option, double check to see if dont just want to remove the visualization's folder instead.
- `featureFlag` (_optional_): this takes a string to tie it to the feature flag subsystem. if the flag is disabled, the visualization type will be removed from the `ViewTypeDropdown`.
- `name`(_required_): a human readable name for the visualization type. this string is what shows up on the `ViewTypeDropdown` component when prompting the user to change the visualization type
- `graphic` (_required_): currently these are svg images, stored as react components, that get used as icons for the `ViewTypeDropdown` to differentiate the visualization types with pictures
- `initial` (_required_): the default values for the ViewProperties that are being passed in. this is used to normalize data that comes in from the API and as a means of ensuring we dont get any errors when switching between visualization types. This was previously done through `src/views/helpers` with some strange rules.
- `component` (_required_): The visualization to render for the `View`. These defintions were previously found in `src/shared/components` and controlled by the `ViewSwitcher`. The majority of these components take ViewProperties and FluxResults, normalize them, and translate them into a giraffe interface.
- `options` (_optional_): this is a component that represents the interface used to configure the ViewProperties of a visualization. The defintions of this aspect of a visualization used to be everywhere, but mostly in `src/timeMachine/components/view_options`.
