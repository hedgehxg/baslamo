<script src="dep/jquery-3.7.1.min.js"></script>
<script src="dep/jquery.csv.min.js"></script>
<script src="dep/js-yaml.js"></script>
<script src="script.js"></script>
<script src="labels.js"></script>
<style>
.entry {
	border-top: 1px solid #ccc;
	padding-top: 0.5em;
	padding-bottom: 0.5em;
}
.entry-head {
	padding-left: 1.5em;
	text-indent: -1.5em;
}
.entry-details-table {
	width: 100%;
	table-layout: fixed;
	border: solid 0px;
	padding-left: 1.5em;
}
.entry-details {
	color: #000;
	font-size: 100%;
	padding-left: 0.5em;
	border-left: 1px solid #ccc;
}
</style>
# Dictionary

Here, you can see all of Baslamo's vocabulary in one central place! You can search a Baslamo or English word in the input box, or search by a specific field by using <code>@field term</code>. This input uses RegEx, so you can use things like <code>^$</code> for empty strings or <code>.</code> for any text.

The fields are always all-lowercase, and include <code>xx_def</code>, <code>xx_notes</code>, <code>xx_tags</code> (replace <code>xx</code> with a language code, e.g. <code>en</code> for English), <code>etymology</code>, <code>etym_tags</code>, and <code>derive</code>.

Click on an entry to expand it. If you don't like looking at all the empty fields, you can select "All non-empty" in the dropdown next to the input box.

Show:
<select class="btn btn-default btn-sm" name="show" id="fields-selector" onchange="run();">
	<option value="All">All</option>
	<option value="AllNonempty">All non-empty</option>
</select>
<input type="text" value="" id="filter-text">
[Go](#){: .btn .btn-default .btn-sm #filter-button onclick="run();" }
<span id="result-count"></span>
<br /><br />
<div id="results"></div>