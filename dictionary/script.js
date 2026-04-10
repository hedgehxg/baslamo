
var g_lexicon = [];
//var g_selection = "All";

const lConsonants = "ptkbdgfsxvljmn";

const lVowels = "aeiou";


function is_string(v) {
    return Object.prototype.toString.call(v) === '[object String]';
}

function is_array(v) {
    return Object.prototype.toString.call(v) === '[object Array]';
}

const HTML_CHAR_TO_ENTITY = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function with_replaced_html_tag(tag) {
    return HTML_CHAR_TO_ENTITY[tag] || tag;
}

function with_escaped_html(str) {
    return str.replace(/[&<>]/g, with_replaced_html_tag);
}

function hget(map, field) {
	if (map === null || field === null) return "";
	if (field.endsWith("_def")) field += "inition";
	if (field in map) {
		return map[field];
	} else return "";
}

function parsed_filter(filter) {
	var split_filter = filter
		.replace("\\@", "\u0091")
		.split("@")
		.map((f) => f.replace("\u0091", "@"));
	var col_filters = split_filter.slice(1);
	var map = {};
	map["lemma|en_definition"] = split_filter[0].trim();
	col_filters.forEach((f) => {
		f = f + " ";
		var i = f.indexOf(" ");
		map[f.slice(0, i).trim()] = new RegExp(f.slice(i).trim());
	});
	return map;
}

function validated_by_filter(entry, filter) {
	var pf = parsed_filter(filter);
	var found = false;
	for (k in pf) {
		searched_for = pf[k];
		if (k === "") return;
		if (k === "any") {
			if (searched_for === "") found = false;
			else {
				Object.keys(entry).forEach((gk) => {
					var v = hget(entry, gk);
					if (is_string(v)) {
						if (v.search(pf[k]) >= 0) {
							found = true;
						}
					} else if (is_array(v)) {
						for (e in v) {
							if (is_string(e) && e.search(pf[k]) >= 0) {
								found = true;
							}
						}
					}
				});
			}
		} else {
			k.split("|").forEach((key) => {
				if (hget(entry, key).search(searched_for) >= 0)
					found = true;
			});
		}
		if (!found)
			return false;
		found = false;
	}
	return true;
}

function convert_to_abugida(str) {
	var result = "";
	result = str.replace(/s\b/gm, "z") // replace -s with special coda s character
	result = result.replace(/([ptkbdgfsxvljmn])\b/gm, "$1c") // replace -C with -C + null vowel mark
	result = result.replace(/([^^])s([ptkbdgfsxvljmn])/gm, "z$1") // replace -sC- with special coda s character + C-
	result = result.replace(/([ptkbdgfsxvljmn])([ptkbdgfsxvljmn])/gm, "$1c$2") // replace -CC- with -C + null vowel mark + C-
	result = result.replace(/([ptkbdgfsxvljmn])a/gm, "$1") // replace Ca with C
	result = result.replace(/(^\W|^|\b)a/gm, "$1h") // replace word-beginning a with null consonant
	result = result.replace(/(^\W|^|\b)([eiou])/gm, "$1h$2") // replace word-beginning eiou with null consonant + eiou
	result = result.replace(/([aeiou])a/gm, "$1h") // replace -Va- with -V + null consonant
	result = result.replace(/([aeiou])([eiou])/gm, "$1h$2") // replace -V[eiou]- with -V + null consonant + eiou
	result = result.replace(/([pfsvjn])e/gm, "$1E") // replace e with E on descender characters
	result = result.replace(/([pfsvjn])i/gm, "$1I") // replace i with I on descender characters
	return result;
}

function html_entry_for(entry, field_selection) {
	if (!entry.hasOwnProperty("en_definition")) {
		var lemma = entry["lemma"];
		console.log(`⚠ ⟦${lemma}⟧ lacks field ⟦en_definition⟧!`);
		entry["en_definition"] = "";
	}
	var convert = entry["convert"]
	entry["convert"] = convert_to_abugida(entry["lemma"])
	ehtml = "<summary class='entry-head'><b style='color: #000000;'>"
		+ with_escaped_html(entry["lemma"]) + "</b> • <b style='font-family: Baslamo Regular;'>" + with_escaped_html(entry["convert"]) + "</b>";
	ehtml += " <i style='font-size: 75%;'>"
		+ with_escaped_html(entry["pos"]) + "</i> — ";
	ehtml += with_escaped_html(entry["en_definition"]) + "</summary>";
	details = [];
	for (field_name in entry) {
		if (field_selection === "AllNonempty" && ["", []].includes(entry[field_name]))
			continue;
		if (!["lemma", "pos", "en_definition", "convert"].includes(field_name)) {
			value = entry[field_name];
			if (value == null) value = "";
			if (!is_string(value)) {
				value = JSON.stringify(value);
			}
			if (field_name in field_label_map) {
				display_text = field_label_map[field_name];
			} else {
				display_text = field_name;
				console.log("Unsupported field name: " + field_name);
			}
			value = with_escaped_html(value);
			details.push("<b>" + display_text + ":</b> " + value + "<br />");
		}
	}
	var n = Math.ceil(details.length / 2);
	var d1 = details.slice(0, n);
	var d2 = details.slice(n);
	ehtml += "<table class='entry-details-table'><tr>";
	ehtml += "<td class='entry-details'>" + d1.join("") + "</td>";
	ehtml += "<td class='entry-details'>" + d2.join("") + "</td>";
	ehtml += "</tr></table>";
	return "<details class='entry'>\n" + ehtml + "\n</details>\n";
}

function run() {
	var field_selection = document.getElementById("fields-selector").value;
	var filter = document.getElementById("filter-text").value;
	var html = "";
	var count = 0;
	// if (filter !== "") {
		for (const entry of g_lexicon) {
			if (filter != "" && !validated_by_filter(entry, filter)) continue;
			count += 1;
			html += html_entry_for(entry, field_selection);
		}
	// } uncomment this for disabling loading the whole lexicon when the filter is empty, in case this gets too slow if the lexicon gets too big.
	html += "<div class='entry'></div>\n";
	document.getElementById("result-count").innerHTML = "(" + count + " results)";
	document.getElementById("results").innerHTML = html;
}

function get_url_parameters() {
	return window.location.search.substr(1).split('&').reduce(
		function (map, item) {
			var parts = item.split('=');
			map[parts[0]] = parts[1];
			return map;
		},
		{}
	);
}

function setup_2(lexicon) {
	g_lexicon = lexicon;
	var s = "";
	Object.keys(lexicon).forEach((k) => {
		if (k !== "langdata")
			s += `<option value='${k}'>${k}</option>`;
	});
	//document.getElementById("fields-selector").innerHTML += s;
	//document.addEventListener('keydown', handle_keydown, true);
	const filter_text_input = document.getElementById('filter-text');
	filter_text_input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter')
			run();
	});
	params = get_url_parameters();
	filter = "";
	for (key in params) {
		if (key != "")
			filter += "@" + key + " " + params[key];
	}
	filter_text_input.value = filter;
	run();
}

function setup() {
	fetch('./lexicon.yaml')
    .then((response) => response.text())
    .then((yaml) => {setup_2(jsyaml.load(yaml))});
}

setup();
 
