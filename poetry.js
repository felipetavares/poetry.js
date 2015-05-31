String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

poetryjs = {
	"process": function (element) {
		var raw_code = element.innerHTML;
		var buffer = '';
		var endline = true;
		var out = '';
		var do_out = true;
		var in_code_line = false;
		var open = false;
		var colors = false;
		var line = '';

		for (i in raw_code) {
			var c = raw_code[i];

			if (c == '\n') {
				if (in_code_line) {
					if (colors = poetryjs.eval(buffer)) {
						if (open)
							out += "</span>";
						
						out += "<span style='color: "+poetryjs.color+";'>"

						open = true;
					}
					buffer = '';
					in_code_line = false;
					do_out = false;
				}
			
				line = poetryjs.add_details(line, colors);

				out += line;
				line = "";
				
				endline = true;
			}

			if (endline && c == '|') {
				in_code_line = true;
			} else {
				if (in_code_line) {
					buffer += c;
				} else {
					if (do_out) {
						line += c;
					} else
						do_out = true;
				}
			}

			if (c != '\n')
				endline = false;
		}

		if (open)
			out += "</span>";

		element.innerHTML = out;
	},
	"add_details": function (line, details) {
		var stops = [];
		
		if (details) {
			for (d in details) {
				var detail = details[d];
				
				for (p in detail.patterns) {
					var pattern = detail.patterns[p];
					var start = 0;
					var index = 0;

					while ((index = line.indexOf(pattern, start)) >= 0) {
						stops.push ({
							"color": detail.color,
							"start": index,
							"end": index+pattern.length
						});
						start = index+pattern.length;
					}
				}
			}
		}

		for (s in stops) {
			for (t in stops) {
				if (s == t)
					continue;

				if (stops[t].start > 0)
					if ((stops[s].start >= stops[t].start &&
						stops[s].end <= stops[t].end)) {
						stops[s].start = -1;
						stops[s].end = -1;
					}
			}
		}

		for (s in stops) {
			if (stops[s].start < 0)
				continue;

			var stop = stops[s];
			var a = "<span style='color: "+stop.color+";'>";
			var b = "</span>"
			
			line = line.insert(stop.start, a);
			

			for (k in stops) {
				if (stops[k].start >= stop.start) {
					if (k != s)
						stops[k].start += a.length;
					stops[k].end += a.length;
				}
			}

			line = line.insert(stop.end, b);


			for (k in stops) {
				if (k == s)
					continue;

				if (stops[k].start >= stop.end) {
					stops[k].start += b.length;
					stops[k].end += b.length;
				}
			}
		}


		return line;
	},
	"cur": function () {
		while (poetryjs.code.length > 0 && poetryjs.code[0] == "")
			poetryjs.next();
		if (poetryjs.code.length > 0)
			return poetryjs.code[0];
		else
			return "";
	},
	"next": function () {
		poetryjs.code.splice(0, 1);
	},
	"colortable": {
		"code": "#66D9EF",
		"tag": "#F92672",
		"normal": "#524f52",
		"string": "#E6DB74",
		"comment": "#75715E",
		"number": "#AE81FF",
		"constant": "#AE81FF",
		"keyword": "#F92672",
		"class": "#A6E22E"
	},
	"eval": function (line) {
		var i;
		poetryjs.code = line.split(" ");

		if (poetryjs.cur() == "let") {
			while (true) {
				poetryjs.next();
				
				if (poetryjs.cur() == "")
					break;
				
				var key = poetryjs.cur();
				poetryjs.next();

				if (poetryjs.cur() == "be") {
					poetryjs.next();
					
					var value = poetryjs.cur();
	
					poetryjs.colortable[key] = value;
				} else {
					poetryjs.error("be");
				}
			}
		} if (poetryjs.cur() == "paint") {
			poetryjs.next();

			if (poetryjs.cur() == "as") {
				poetryjs.next();

				console.log ("poetry.js: painting as "+poetryjs.cur());

				poetryjs.color = poetryjs.colortable[poetryjs.cur()];

				if (!poetryjs.color) {
					poetryjs.color = poetryjs.cur();
				}

				var colors = [];

				poetryjs.next();
				if (poetryjs.cur() == "with") {
					var count = 0;
					
					while (++count) {
						poetryjs.next();

						var pattern = {
							"patterns": [],
							"color": ""
						};

						if (poetryjs.cur() != "") {
							pattern.patterns.push(poetryjs.cur());

							poetryjs.next();

							if (poetryjs.cur() == "as" || poetryjs.cur() == "and") {
								while (poetryjs.cur() == "and") {
									poetryjs.next();
									pattern.patterns.push(poetryjs.cur());
									poetryjs.next();
								}

								poetryjs.next();

								if (poetryjs.cur() != "") {
									pattern.color = poetryjs.colortable[poetryjs.cur()];

									if (!pattern.color) {
										pattern.color = poetryjs.cur();
									}
								} else {
									poetryjs.error("color");
								}
							} else {
								poetryjs.error("as or and");
							}
						} else {
							if (count == 1)
								poetryjs.error("pattern");
							break;
						}
					
						colors.push(pattern);
					}
				}

				return colors;
			} else {
				poetryjs.error("as");
			}
		}
	},
	"error": function (expecting) {
		console.log ("poetry.js: syntax error: expecting " + expecting);
		console.log ("poetry.js: found '" + poetryjs.cur() + "'");
	}
};

window.onload = function () {
	var poetry = document.getElementsByClassName("poetry");
	
	for (i in poetry) {
		poetryjs.process(poetry[i]);
	}
}
