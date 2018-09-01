import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Animated, Platform, View } from 'react-native'
import OverlayView from './OverlayView'

const isIOS = Platform.OS === 'ios'

export default class CircleQuickAction extends Component {
  static propTypes = {
    renderContent: PropTypes.func,
    backgroundColor: PropTypes.string,
    didOpen: PropTypes.func,
    willOpen: PropTypes.func,
    willClose: PropTypes.func,
    didClose: PropTypes.func,
    springConfig: PropTypes.shape({
      tension: PropTypes.number,
      friction: PropTypes.number,
    }),
    items: PropTypes.array,
    inactiveColor: PropTypes.string,
    deactiveColor: PropTypes.string
  }

  static defaultProps = {
    willOpen: () => { },
    didOpen: () => { },
    willClose: () => { },
    didClose: () => { },
    onPress: () => { },
    shouldEnable: () => { },
    deactiveColor: 'white',
    inactiveColor: 'red',
    styleLabel: {
      fontSize: 24,
      color: 'white',
      fontFamily: "SFProDisplay-Bold"
    },
    styleBgLabel: {
      position: 'absolute',
      zIndex: 100,
      height: 50,
      borderRadius: 100,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center'
    },
    items: [ // maximum = 4
      {
        label: 'A',
        image: '',
        handler: () => {
          alert('A')
        }
      },
      {
        label: 'B',
        image: '',
        handler: () => {
          alert('B')
        }
      },
      {
        label: 'C',
        image: '',
        handler: () => {
          alert('C')
        }
      }
    ]
  }

  state = {
    isOpened: false,
    pan: new Animated.Value(0),
    animVal: new Animated.Value(0),
    frame: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
  }

  longPressTimeOut = null
  touchedAtTime = 0
  movedDistance = 0
  selectedIndex = -1
  gestureReleased = false
  touchOrigin = null

  reset() {
    if (this.longPressTimeOut) clearTimeout(this.longPressTimeOut)
    this.longPressTimeOut = null
    this.movedDistance = 0
    this.pressInLocation = null
    this.gestureReleased = true
    this.touchOrigin = null
  }

  updateSelectedIndex(index) {
    this.selectedIndex = index
  }

  componentWillMount() {
    const self = this
    this._responder = {
      // Ask to be the responder:
      onStartShouldSetResponder: (evt, gestureState) => true,
      // onStartShouldSetResponderCapture: (evt, gestureState) => false,
      // onMoveShouldSetResponder: (evt, gestureState) => false,
      // onMoveShouldSetResponderCapture: (evt, gestureState) => false,
      onResponderTerminationRequest: (evt, gestureState) => {
        return true
      },

      onResponderGrant: (evt, gestureState) => {
        evt.persist()
        this.selectedIndex = -1
        this.touchEvt = evt.nativeEvent
        this.touchedAtTime = Date.now()
        this.longPressTimeOut = setTimeout(() => {
          if (this.movedDistance > 2) return

          this.touchOrigin = {
            pageX: evt.nativeEvent.pageX,
            pageY: evt.nativeEvent.pageY
          }
          this.open()

          // this.setState({ isPanning: true })
          // this.state.pan.setValue(0)
        }, 250)
      },
      onResponderMove: (evt, gestureState) => {
        var pageX = evt.nativeEvent.pageX
        var pageY = evt.nativeEvent.pageY
        this.touchEvt = evt.nativeEvent
        if (this.pressInLocation) {
          this.movedDistance = this._getDistanceBetweenPoints(pageX, pageY, this.pressInLocation.pageX, this.pressInLocation.pageY);
          if (Platform.OS === 'android' && pageY - this.pressInLocation.pageY > 0 && Math.abs(pageX - this.pressInLocation.pageX) <= 2) {
            this.props.shouldEnable(false)
          }
        }

        this._savePressInLocation(evt)

        if (this.movedDistance > 10) {
          this.longPressTimeOut && clearTimeout(this.longPressTimeOut);
          this.longPressTimeOut = null;
        }

        if (this.state.isOpened) {
          this.setState({})
        }
      },
      onResponderRelease: (evt, gestureState) => {
        this.reset()
        if (Platform.OS === 'android') {
          this.props.shouldEnable(true)
        }
        if (this.state.isOpened) {
          this.close()
        }

        if (Date.now() - this.touchedAtTime <= 100 && this.movedDistance < 0.5) {
          return this.props.onPress()
        }
      },
      onResponderTerminate: (evt, gestureState) => {
        if (this.state.isOpened) {
          this.close()
        }
        this.reset()
      }
    }
  }

  _savePressInLocation(e) {
    var pageX = e.nativeEvent.pageX;
    var pageY = e.nativeEvent.pageY;
    var locationX = e.nativeEvent.locationX;
    var locationY = e.nativeEvent.locationY;
    this.pressInLocation = { pageX, pageY, locationX, locationY };
  }

  _getDistanceBetweenPoints(aX, aY, bX, bY) {
    var deltaX = aX - bX;
    var deltaY = aY - bY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  getContent = () => {
    if (this.props.renderContent) {
      return this.props.renderContent()
    }
    const child = React.Children.only(this.props.children)
    return React.cloneElement(child, {})
  }

  getOverlayProps = () => ({
    isOpened: this.state.isOpened,
    frame: this.state.frame,
    touchUpdate: this.touchEvt && { pX: this.touchEvt.pageX, pY: this.touchEvt.pageY },
    touchOrigin: this.touchOrigin,
    backgroundColor: this.props.backgroundColor,
    children: this.getContent(),
    didOpen: this.props.didOpen,
    willClose: this.props.willClose,
    close: this.close,
    items: this.props.items,
    inactiveColor: this.props.inactiveColor,
    deactiveColor: this.props.deactiveColor,
    styleLabel: this.props.styleLabel,
    styleBgLabel: this.props.styleBgLabel
  })

  open = () => {
    const { isOpened, willOpen, didOpen } = this.props
    willOpen()
    // alert(this.view)
    // return
    this.view.measure((ox, oy, width, height, px, py) => {
      this.setState({
        isAnimating: true,
        isOpened: true,
        frame: {
          width,
          height,
          x: px,
          y: py,
        },
      }, () => {
        didOpen()
        // this.setState({ isAnimating: false })
      })
    })
  }

  close = () => {

    this.setState({
      isPanning: false,
      isOpened: false,
    }, () => {
      this.props.didClose()
      if (this.selectedIndex != -1) {
        setTimeout(this.props.items[this.selectedIndex].handler, 50)
      }
    })
  }

  render() {
    const { isOpened } = this.state

    return (
      <View
        ref={v => this.view = v}
        style={this.props.style}
        onLayout={() => { }} // need to run measure on Android
      >
        <View
          {...this._responder}
        >
          {this.props.children}
        </View>
        {isOpened && <OverlayView {...this.getOverlayProps()} setSelectedIndex={this.updateSelectedIndex.bind(this)}
        />}
      </View>
    )
  }
}