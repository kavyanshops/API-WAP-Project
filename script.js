const list = document.getElementById("list");
const status = document.getElementById("status");
const count = document.getElementById("count");

fetch("https://restcountries.com/v3.1/all?fields=name,flags")
	.then((res) => res.json())
	.then((data) => {
		status.textContent = `${data.length} countries loaded`;
		count.textContent = `Showing 12 countries`;
		list.innerHTML = data.slice(0, 12).map((country) => `
			<div class="card">
				<img src="${country.flags.png}" alt="${country.name.common} flag">
				<h3>${country.name.common}</h3>
			</div>
		`).join("");
	})
	.catch(() => {
		status.textContent = "Failed to load data";
	});
