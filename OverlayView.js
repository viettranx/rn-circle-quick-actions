import React, { PureComponent } from 'react'
import {
  Animated,
  Modal,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  View,
  Dimensions
} from 'react-native'

import PropTypes from 'prop-types'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import CircleActionItem from './CircleActionItem'


const STATUS_BAR_OFFSET = (Platform.OS === 'android' ? 0 : 0)
const isIOS = Platform.OS === 'ios'
const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  overlayBackground: {
    flex: 1
  },
  open: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    // Android pan handlers crash without this declaration:
    backgroundColor: 'black',
  }
})

export default class OverlayView extends PureComponent {
  static propTypes = {
    frame: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number,
    }),
    springConfig: PropTypes.shape({
      tension: PropTypes.number,
      friction: PropTypes.number,
    }),
    backgroundColor: PropTypes.string,
    isOpen: PropTypes.bool,
    onOpen: PropTypes.func,
    close: PropTypes.func,
    willClose: PropTypes.func
  }

  static defaultProps = {
    backgroundColor: 'white',
  }

  state = {
    target: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    openVal: new Animated.Value(0),
  }

  componentDidMount() {
    if (this.props.isOpened) {
      this.open()
    }
  }

  open = () => {
    // if (isIOS) {
    //   StatusBar.setHidden(true, 'fade')
    // }
    this.setState({
      target: {
        opacity: 0.92,
      }
    })

    Animated.timing(
      this.state.openVal,
      {
        toValue: 1,
        duration: 200
      }
    ).start(() => {
      this.props.didOpen()
    })
  }

  close = () => {
    this.props.willClose()
    if (isIOS) {
      StatusBar.setHidden(false, 'fade')
    }

    Animated.timing(
      this.state.openVal,
      {
        toValue: 0
      }
    ).start(() => {
      this.props.close()
    })
  }

  componentWillReceiveProps(props) {
    if (this.props.isOpened != props.isOpened && props.isOpened) {
      this.open()
    }
  }

  getPositionLabel(pageY) {
    if (pageY <= height / 2) {
      return { bottom: 20 }
    }
    return { top: Platform.OS === 'ios' ? 20 + getStatusBarHeight() : 20 }
  }

  getStartAngle(pageX, pageY) {
    let startAngle = Math.PI / 4
    if (pageX < 90) {
      startAngle = Math.PI / 5 * 3
      if (pageY < 150) {
        startAngle = startAngle + Math.PI / 4
      } else if (pageY > height - 90) {
        startAngle = startAngle - Math.PI / 10
      }
    } else if (pageX > width - 90) {
      startAngle = - Math.PI / 10
      if (pageY < 150) {
        startAngle = startAngle - Math.PI / 4
      } else if (pageY > height - 90) {
        startAngle = startAngle + Math.PI / 10
      }
    }
    return startAngle
  }

  render() {
    const {
      isOpened,
      renderHeader,
      swipeToDismiss,
      frame,
      backgroundColor,
      items
    } = this.props

    const {
      openVal,
      target
    } = this.state

    const bgOpacity = {
      opacity: openVal.interpolate({ inputRange: [0, 1], outputRange: [0, target.opacity] })
    }

    const background = (
      <Animated.View style={[styles.overlayBackground, { backgroundColor: backgroundColor }, bgOpacity]}></Animated.View>
    )

    const contentStyle = {
      position: 'absolute',
      top: frame.y + STATUS_BAR_OFFSET,
      left: frame.x,
      width: frame.width,
      height: frame.height,
      zIndex: 10
    }
    const content = (
      <View style={contentStyle}>
        <TouchableWithoutFeedback onPress={() => this.close()}>
          {this.props.children}
        </TouchableWithoutFeedback>
      </View>
    )

    const d = 80
    let selectingIndex = -1
    const startAngle = this.getStartAngle(this.props.touchOrigin.pageX, this.props.touchOrigin.pageY)
    const positionLabel = this.getPositionLabel(this.props.touchOrigin.pageY)
    const itemNodes = items.map((item, index) => {
      const { pX, pY } = this.props.touchUpdate
      const angle = (Math.PI / 4 * index) + startAngle
      const targetX = - Math.cos(angle) * d + this.props.touchOrigin.pageX - 25
      const targetY = - Math.sin(angle) * d + this.props.touchOrigin.pageY - 25
      const isSelecting = (pX >= targetX && pX <= targetX + 50) && (pY >= targetY && pY <= targetY + 50)
      if (isSelecting) {
        selectingIndex = index
      }

      return <CircleActionItem
        styleLabel={this.props.styleLabel}
        styleBgLabel={this.props.styleBgLabel}
        inactiveColor={this.props.inactiveColor}
        deactiveColor={this.props.deactiveColor}
        item={item}
        isSelecting={isSelecting}
        key={index}
        targetX={targetX}
        targetY={targetY}
        ox={this.props.touchOrigin.pageX}
        oy={this.props.touchOrigin.pageY}
      />
    })

    this.props.setSelectedIndex(selectingIndex)


    const label = (selectingIndex !== -1) && (
      <View
        style={[this.props.styleBgLabel,
        { backgroundColor: items[selectingIndex].activeColor },
          positionLabel
        ]}>
        <Text style={this.props.styleLabel}>{items[selectingIndex].label}</Text>
      </View>
    )

    return (
      <Modal visible={isOpened} transparent={true} onRequestClose={this.close.bind(this)}>
        {background}
        {content}
        {itemNodes}
        {label}
        {/* <CircleActionItem x={this.props.touchUpdate.pX} y={this.props.touchUpdate.pY}/> */}
      </Modal>
    )
  }
}