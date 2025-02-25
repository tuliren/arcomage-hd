import { stereoPanValue } from '@/constants/visuals'
import { PersonStatusType } from '@/types/state'
import brickDownUrl from '@assets/sfx/brick_down.mp3'
import brickUpUrl from '@assets/sfx/brick_up.mp3'
import damageUrl from '@assets/sfx/damage.mp3'
import dealUrl from '@assets/sfx/deal.mp3'
import defeatUrl from '@assets/sfx/defeat.mp3'
import gemDownUrl from '@assets/sfx/gem_down.mp3'
import gemUpUrl from '@assets/sfx/gem_up.mp3'
import recruitDownUrl from '@assets/sfx/recruit_down.mp3'
import recruitUpUrl from '@assets/sfx/recruit_up.mp3'
import startUrl from '@assets/sfx/start.mp3'
import towerUpUrl from '@assets/sfx/tower_up.mp3'
import typingUrl from '@assets/sfx/typing.mp3'
import victoryUrl from '@assets/sfx/victory.mp3'
import wallUpUrl from '@assets/sfx/wall_up.mp3'

const audioContext = new (window.AudioContext ||
  (window as typeof window & { webkitAudioContext: unknown })
    .webkitAudioContext)()
const gainNode = audioContext.createGain()
gainNode.gain.value = 0.5
gainNode.connect(audioContext.destination)

const soundAdditionalTypes = [
  'deal',
  'victory',
  'defeat',
  'start',
  'typing',
] as const

type soundTypeType =
  | keyof PersonStatusType
  | (typeof soundAdditionalTypes)[number]

const audioMap = {
  tower: {
    up: 'towerUp',
    down: 'damage',
  },
  wall: {
    up: 'wallUp',
    down: 'damage',
  },
  bricks: {
    up: 'brickUp',
    down: 'brickDown',
  },
  brickProd: {
    up: 'brickUp',
    down: 'brickDown',
  },
  gems: {
    up: 'gemUp',
    down: 'gemDown',
  },
  gemProd: {
    up: 'gemUp',
    down: 'gemDown',
  },
  recruits: {
    up: 'recruitUp',
    down: 'recruitDown',
  },
  recruitProd: {
    up: 'recruitUp',
    down: 'recruitDown',
  },
  deal: 'deal',
  victory: 'victory',
  defeat: 'defeat',
  start: 'start',
  typing: 'typing',
}

const loadAudio = async (url: string): Promise<AudioBuffer> => {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  return audioBuffer
}

const audioBufferPromises: Record<string, Promise<AudioBuffer>> = {
  towerUp: loadAudio(towerUpUrl),
  wallUp: loadAudio(wallUpUrl),
  brickUp: loadAudio(brickUpUrl),
  gemUp: loadAudio(gemUpUrl),
  recruitUp: loadAudio(recruitUpUrl),
  brickDown: loadAudio(brickDownUrl),
  gemDown: loadAudio(gemDownUrl),
  recruitDown: loadAudio(recruitDownUrl),
  damage: loadAudio(damageUrl),
  deal: loadAudio(dealUrl),
  victory: loadAudio(victoryUrl),
  defeat: loadAudio(defeatUrl),
  start: loadAudio(startUrl),
  typing: loadAudio(typingUrl),
}

export const setVolume = (volume: number): void => {
  gainNode.gain.value = volume / 10
}

/**
 * Play sound
 * @param type - sound type name
 * @param increase - increase or decrease, only for `tower`, `wall` and resource-related
 * @param pan - stereo pan value, `-1` to `1`,
 * if it's boolean, then: `true`: -stereoPanValue (real left);
 * `false`: stereoPanValue (real right)
 */
export const play = (
  type: soundTypeType,
  increase: boolean | null = null,
  pan: boolean | number = 0,
): void => {
  const audioName: string = (() => {
    const tempObj = audioMap[type]
    if (typeof tempObj === 'object' && 'up' in tempObj) {
      return increase ? tempObj.up : tempObj.down
    } else {
      return tempObj as string
    }
  })()

  const audioBufferPromise = audioBufferPromises[audioName]

  const _pan: number = (() => {
    if (typeof pan === 'boolean') {
      return pan ? -stereoPanValue : stereoPanValue
    } else {
      return pan
    }
  })()

  audioBufferPromise.then((audioBuffer) => {
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer

    const panner = audioContext.createStereoPanner()
    panner.pan.value = _pan

    source.connect(panner)
    panner.connect(gainNode)

    source.start()
  })
}
