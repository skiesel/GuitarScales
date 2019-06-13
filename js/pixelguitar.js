var guitar = {
	setSpecs : function(specs) {
		this.specs = specs;
		this.updateSize();
	},

	updateSize : function() {
		var bottomCanvas = document.getElementById("bottomCanvas");
		this.fullGuitarLength = bottomCanvas.width - 2;

		this.resizeRatio = this.fullGuitarLength / this.specs.fullGuitarLengthMM;

		this.fullNeckPieceLength = this.specs.fullNeckPieceLengthMM * this.resizeRatio;
		this.scaleLength = this.specs.scaleLengthMM * this.resizeRatio;
		this.fingerboardLength = this.specs.fingerboardLengthMM * this.resizeRatio;
		this.fingerboardWidth = this.specs.fingerboardWidthMM * this.resizeRatio;
		this.bridgeLength = this.specs.bridgeLengthMM * this.resizeRatio;
		this.bridgeWidth = this.specs.bridgeWidthMM * this.resizeRatio;

		this.tunerCenterFromNut = this.specs.tunerCenterFromNutMM * this.resizeRatio;
		this.tunerArrayLength = this.specs.tunerCenterFromNutMM * this.resizeRatio;
		this.smallTunerOffsetFromCenterLine = this.specs.smallTunerOffsetFromCenterLineMM * this.resizeRatio;

		this.headstockLength = this.fullNeckPieceLength - this.fingerboardLength;

		this.bridgeStartX = bottomCanvas.width - this.scaleLength - this.headstockLength - this.bridgeLength / 2;
		this.bridgeStartY = (bottomCanvas.height - this.bridgeWidth) / 2;

		this.fingerboardStartX = this.bridgeStartX + this.scaleLength - this.fingerboardLength;
		this.fingerboardEndX = this.fingerboardStartX + this.fingerboardLength;
		this.fingerboardStartY = (bottomCanvas.height - this.fingerboardWidth) / 2;
		this.fingerboardEndY = this.fingerboardStartY + this.fingerboardWidth;

		this.inlaySize = 0.05 * this.fingerboardWidth;

		var lastFretXPosition = this.scaleLength;
		this.fretXs = [lastFretXPosition + this.bridgeStartX];

		for(var fret = 1; fret < this.specs.nFrets+1; fret++) {
			var nextFretPosition = lastFretXPosition / this.specs.fretSpacingRatio;
			this.fretXs.push(nextFretPosition + this.bridgeStartX);
			lastFretXPosition = nextFretPosition;
		}

		var tunerCenterX = this.fingerboardEndX + this.tunerCenterFromNut;
		var tunerCenterY = bottomCanvas.height / 2 - this.smallTunerOffsetFromCenterLine;
		var tunerSpacing = this.tunerArrayLength / 5;

		var rotationMultiplier = Math.cos(this.specs.tunerRotation);

		var stringStartX = this.bridgeStartX + this.bridgeLength / 2;
		var stringSpacing = this.fingerboardWidth / 7;

		this.stringYs = [];
		this.stringXs = [];

		for(var string = 1; string < 7; string++) {
			var stringY = this.fingerboardStartY + stringSpacing * string;

			this.stringYs.push(stringY);

			var xOffset;
			if(string <= 3) {
				xOffset = tunerSpacing * -(3 - string + 0.5);
			} else {
				xOffset = tunerSpacing * (string - 4 + 0.5);
			}

			var stringEndX = (xOffset * rotationMultiplier) + tunerCenterX;

			this.stringXs.push([stringStartX, stringEndX]);
		}
	},

	drawStructure : function() {
		var bottomCanvas = document.getElementById("bottomCanvas");
		var bottomCtx = bottomCanvas.getContext("2d");

		//Bridge
		bottomCtx.rect(this.bridgeStartX,this.bridgeStartY,this.bridgeLength,this.bridgeWidth);
		bottomCtx.stroke();

		//Neck
		bottomCtx.rect(this.fingerboardStartX,this.fingerboardStartY,this.fingerboardLength,this.fingerboardWidth);
		bottomCtx.stroke();

		var inlayY = this.fingerboardStartY + this.fingerboardWidth/2;

		// Frets and Inlays
		for(var i = 0; i < this.fretXs.length; i++) {

			var fret = i + 1;
			if(this.specs.inlayFrets.indexOf(fret) >= 0) {

				var inlayX = (this.fretXs[i] + this.fretXs[fret]) / 2;
				if(this.specs.doubleInlayFrets.indexOf(fret) >= 0) {
					bottomCtx.beginPath();
					bottomCtx.arc(inlayX, this.fingerboardStartY + this.fingerboardWidth/4, this.inlaySize, 0, 2 * Math.PI, false);
					bottomCtx.fill();
					bottomCtx.beginPath();
					bottomCtx.arc(inlayX, this.fingerboardStartY + 3*this.fingerboardWidth/4, this.inlaySize, 0, 2 * Math.PI, false);
					bottomCtx.fill();
				} else {
					bottomCtx.beginPath();
					bottomCtx.arc(inlayX, inlayY, this.inlaySize, 0, 2 * Math.PI, false);
					bottomCtx.fill();
				}
			}

			bottomCtx.beginPath();
			bottomCtx.moveTo(this.fretXs[i], this.fingerboardStartY);
			bottomCtx.lineTo(this.fretXs[i], this.fingerboardStartY+this.fingerboardWidth);
			bottomCtx.stroke();
		}

		var tunerSize = 0.075 * this.fingerboardWidth;

		//Strings & Tuners
		for(var i = 0; i < this.stringXs.length; i++) {
			bottomCtx.beginPath();
			bottomCtx.arc(this.stringXs[i][1], this.stringYs[i], tunerSize, 0, 2 * Math.PI, false);
			bottomCtx.fill();
		}
	},

	drawStrings : function(disabledStrings) {
		var middleCanvas = document.getElementById("middleCanvas");
		var middleCtx = middleCanvas.getContext("2d");

		middleCtx.clearRect(0,0,middleCanvas.width,middleCanvas.height);
		for(var i = 0; i < this.stringXs.length; i++) {
			if(disabledStrings.indexOf(strings[i]) < 0) {
				middleCtx.strokeStyle = "#000000";
				middleCtx.lineWidth = "2";
			} else {
				middleCtx.strokeStyle = "#C0C0C0";
				middleCtx.lineWidth = "1";
			}

			middleCtx.beginPath();
			middleCtx.moveTo(this.stringXs[i][0], this.stringYs[i]);
			middleCtx.lineTo(this.stringXs[i][1], this.stringYs[i]);
			middleCtx.stroke();
		}
	},

  drawBlockedFrets : function(disabledFrets) {
		var middleCanvas = document.getElementById("middleCanvas");
		var middleCtx = middleCanvas.getContext("2d");

		middleCtx.fillStyle = "rgba(192, 192, 192, 0.75)";

		for(var i = 0; i < disabledFrets.length; i++) {
			var fret = disabledFrets[i];
			var previousFret = fret - 1;
			var nextFret = fret + 1;

			var startX = (this.fretXs[nextFret] + this.fretXs[fret]) / 2;

			var endX;
			if(fret == 0) {
				endX = this.fretXs[0] + (this.fretXs[0] - (this.fretXs[0] + this.fretXs[1]) / 2);
			} else {
				endX = (this.fretXs[previousFret] + this.fretXs[fret]) / 2;
			}

			middleCtx.fillRect(startX, this.fingerboardStartY, (endX - startX), this.fingerboardWidth);
		}
	},

	drawMarkedFretStrings : function(fretStrings) {
		topCtx.beginPath();
		topCtx.arc(guitar.fretXs[0], guitar.stringYs[0], guitar.inlaySize, 0, 2 * Math.PI, false);
		topCtx.fill();
	}
};
