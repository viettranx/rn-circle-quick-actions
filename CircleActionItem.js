import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Animated,
  Platform,
  Image
} from 'react-native'


const isIOS = Platform.OS === 'ios'

export default class CircleActionItem extends Component {

  constructor(props) {
    super(props)
    this.state = {
      openVal: new Animated.Value(0),
      scale: new Animated.Value(1),
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isSelecting != nextProps.isSelecting) {
      const toVal = (nextProps.isSelecting) ? 1.15 : 1

      Animated.timing(
        this.state.scale,
        {
          toValue: toVal,
          duration: 100,
          // useNativeDriver: true
        }
      ).start(() => {
      })

    }
  }

  componentDidMount() {
    Animated.spring(
      this.state.openVal,
      { toValue: 1, tension: 40, friction: 5, duration: 100 }
    ).start(() => {
    })
  }

  render() {
    const { targetX = 0, targetY = 0, ox = 0, oy = 0, isSelecting = false } = this.props
    const { openVal, scale } = this.state
    const item = this.props.item
    const target = {
      top: openVal.interpolate({ inputRange: [0, 1], outputRange: [oy, targetY] }),
      left: openVal.interpolate({ inputRange: [0, 1], outputRange: [ox, targetX] })
    }
    const bgColor = isSelecting ? item.activeColor : this.props.deactiveColor
    let tintColor = {}
    if (isSelecting) {
      tintColor = { tintColor: this.props.deactiveColor }
    }
    const imageAction = (isSelecting && item.imageActive) ? item.imageActive : item.image
    return (
      <Animated.View style={{
        transform: [
          { scale: scale }
        ],
        zIndex: 100,
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        top: target.top,
        left: target.left,
        alignItems: 'center',
        justifyContent: 'center'
      }} >
        <Image source={imageAction} style={[{ width: 50, height: 50, borderRadius: 25 }]} />
      </Animated.View>
    )
  }
}