# Circle Quick Actions
React Native library to display a modal popup quick actions menu by long press.

## Demo

[<img src="https://raw.githubusercontent.com/viettranx/rn-circle-quick-actions/master/screenshots/demo.gif">]()

## Installation

First, download the library from npm:

```
npm install rn-circle-quick-actions --save
```

## Usage

```
import CircleQuickActions from 'rn-circle-quick-actions'

// Max items is 4
const items = [
  {
    image: require('some_image'),
    imageActive: require('some_image_activated'),
    handler: () => {
      alert('First action')
    }
  },
  {
    image: require('some_image'),
    imageActive: require('some_image_activated'),
    handler: () => {
      alert('Second action')
    }
  }
]

const QuickActionView () => (
  <CircleQuickActions
    onPress={() => alert('It is a normal press')}
    items={items}
  >
    <Image
      style={{ width: 320, height: 200 }}
      source={{ uri: 'YOUR_IMAGE_URL' }}
    />
  </CircleQuickActions>
);
```

## Usage: With FlatList or scrollable view

We provided some lifecycle methods (shouldEnable, willOpen, didOpen, didClose) to enable more control your scroll view.

This is an example with Flatlist. We need to control scroll enabled to use pan gesture.

```
export default class App extends Component {

  setScrollEnabled = (isEnabled) => {
    if (this.list) {
      this.list.getScrollResponder().setNativeProps({ scrollEnabled: isEnabled })
    }
  }

  renderListItem = ({ item }) => {
    return (
      <CircleQuickAction
        onPress={() => alert('On press')}
        // shouldEnable={(e) => shouldEnable(e)}
        willOpen={() => this.setScrollEnabled(false)}
        // didOpen={() => onDidOpenMenu()}
        didClose={() => this.setScrollEnabled(true)}
        items={items}
      >
        <Image
          source={item.image}
          style={{ width: 320, height: 300 }}
        />
      </CircleQuickAction>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          ref={list => this.list = list}
          style={{ flex: 1 }}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={this.renderListItem}
        />
      </View>
    );
  }
}
```