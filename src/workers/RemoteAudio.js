
class RemoteAudio {
	constructor (webWorker) {
		this.webWorker = webWorker;
		this.fft = [];
		this.opened = false;
	}

	async tick() {
		if (!this.opened) {
			this.webWorker.openAudioProxy();
			this.opened = true;
		} 
	}

  setCutoff (cutoff) {
    this.cutoff = cutoff
    this.settings = this.settings.map((el) => {
      el.cutoff = cutoff
      return el
    })
  }

  setSmooth (smooth) {
		this.webWorker.setAudioValue("setSmooth", smooth);
  }

  setBins (numBins) {
  	this.numBins = numBins;
  	this.fft = new Array(numBins);
		this.webWorker.setAudioValue("setBins", numBins);
  }

  setScale(scale){
		this.webWorker.setAudioValue("setScale", scale);
  }

  setMax(max) {
		this.webWorker.setAudioValue("setMax", max);
  }

  hide() {
		this.webWorker.setAudioValue("hide", 0);
  }

  show() {
		this.webWorker.setAudioValue("show", 1);
  }
}

export {RemoteAudio}
