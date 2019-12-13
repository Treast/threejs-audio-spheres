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
      });
    };
    request.send();
  }

  play() {
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.context.destination);
    this.source.start(0);
    this.isPlaying = true;
  }

  refreshFrequencies() {
    if (!this.frequenciesArray) this.frequenciesArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(this.frequenciesArray);
  }

  getFrequency(index: number, max: number = this.analyserNode.frequencyBinCount) {
    const i = Math.floor((index * max) / this.analyserNode.frequencyBinCount);
    return this.frequenciesArray[i] / 255.0;
  }
}
