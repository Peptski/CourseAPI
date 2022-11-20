const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/search", (req, res) => {
	console.log(`Handling: ${req.headers.url}`);
	if (req.headers?.url) {
		axios
			.get(req.headers.url)
			.then((result) => {
				codes = [];
				courses = [];

				data = result.data
					.split("<!-- Result Navigation Pane END -->")[1]
					.split("<!-- Result Navigation Pane START -->")[0]
					.split("</tr>")
					.slice(2);

				data.pop();

				data.forEach((ele) => {
					split = ele.split("<td").slice(1);

					courseCode = split[0].slice(
						split[0]
							.slice(0, split[0].search("</a>"))
							.lastIndexOf(">") + 1,
						split[0].search("</a>")
					);
					courseName = split[1].slice(
						split[1]
							.slice(0, split[1].search("</a>"))
							.lastIndexOf(">") + 1,
						split[1].search("</a>")
					);

					points = split[2].slice(1, split[2].search("&"));

					department = split[3].slice(1, split[3].search("<"));

					courseInfo =
						"https://student.portal.chalmers.se" +
						split[4].slice(
							split[4].search('"') + 1,
							split[4]
								.slice(split[4].search('"') + 1)
								.search('"') +
								split[4].search('"') +
								1
						);

					courseHome = split[5].slice(
						split[5].search("https"),
						split[5].slice(split[5].search("https")).search('"') +
							split[5].search("https")
					);

					codes.push(`https://stats.ftek.se/courses/${courseCode}`);

					courses.push([
						courseCode,
						courseName,
						points,
						department,
						courseInfo,
						courseHome,
					]);
				});

				axios.all(codes.map((code) => axios.get(code))).then(
					axios.spread((...resData) => {
						res.json({
							Courses: courses.map((course, index) => {
								if (resData[index].data) {
									passInfo = [
										resData[index].data.passRate,
										resData[index].data.averageGrade,
										resData[index].data.totalPass,
									];
									return course.concat(passInfo);
								} else {
									return course;
								}
							}),
						});
					})
				);
			})
			.catch((error) => console.log(error));
	}
});

app.listen(3000, () => console.log("API Server is running..."));
