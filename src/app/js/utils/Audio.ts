export default class Audio {
  private context: AudioContext;
  private audioBuffer: AudioBuffer;
  private source: AudioBufferSourceNode;
  private gainNode: GainNode;
  private analyserNode: AnalyserNode;
  private frequenciesArray: Uint8Array;

  public isPlaying = false;

  constructor() {
    // @ts-ignore
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    this.source = this.context.createBufferSource();
    this.gainNode = this.context.createGain();
    this.analyserNode = this.context.createAnalyser();
    this.analyserNode.fftSize = 2048;
  }

  load(soundURL: string) {
    const request = new XMLHttpRequest();
    request.open('GET', soundURL, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
      this.context.decodeAudioData(request.response, (buffer: AudioBuffer) => {
        this.audioBuffer = buffer;
        document.body.classList.add('loaded');
      });
    };
    request.send();
  }

  play() {
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.analyserNode);
    this.analyserNode.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.source.start(0);
    this.isPlaying = true;
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = volume;
  }

  refreshFrequencies() {
    if (!this.frequenciesArray) this.frequenciesArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(this.frequenciesArray);
  }

  getFrequencyIndex(index: number, max: number) {
    return Math.floor((index / max) * this.analyserNode.frequencyBinCount);
  }

  getFrequency(index: number, max: number = this.analyserNode.frequencyBinCount) {
    const n1 = this.getFrequencyIndex(index, max);
    const n2 = this.getFrequencyIndex(index + 1, max);

    let acc = 0;
    for (let i = n1; i < n2; i += 1) {
      acc += this.frequenciesArray[i];
    }

    return acc / 255.0 / (n2 - n1 - 1);
  }
}
