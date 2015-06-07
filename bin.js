#!/usr/bin/env node

var WpaState = require('wpa_state')
var chroma = require('chroma-js')

var ifname = process.argv[2] || 'wlan0'
var state = 'unknown'
var ssid = ''

var stateRatings = {
  disconnected: 0,
  inactive: 0,
  scanning: 0.2,
  authenticating: 0.4,
  associating: 0.5,
  associated: 0.6,
  '4way_handshake': 0.7,
  group_handshake: 0.8,
  completed: 1,
  unknown: -0.1,
  interface_disabled: -0.2
}

var valueColors = {
  1: '#00ff00',
  0: '#ff0000',
  '-1': '#ff00ff'
}

function valueColor (value) {
  return value === 0 ? valueColors[0] :
    value > 0 ?
      chroma.interpolate(valueColors[0], valueColors[1], value, 'lab').hex() :
      chroma.interpolate(valueColors[-1], valueColors[0], -value, 'lab').hex()
}

/* compute state colors */
var stateColors = {}
for (var state in stateRatings) {
  stateColors[state] = valueColor(stateRatings[state])
}

function printStatus () {
  process.stdout.write(JSON.stringify([{
    name: 'wpa_state',
    instance: ifname,
    color: stateColors[state],
    full_text: ssid || state
  }]) + '\n')
}

process.stdout.write('{"version":1}\n[\n')

new WpaState(ifname)
.on('error', function () {
  state = 'error'
  printStatus()
})
.on('state', function (s) {
  state = s
  printStatus()
})
.on('ssid', function (e) {
  ssid = e
  printStatus()
})
.connect()
