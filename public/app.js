// This file connects the pretty page to our backend.

const courseList = document.querySelector("#course-list");
const courseForm = document.querySelector("#course-form");
const generatedCourse = document.querySelector("#generated-course");

// This function draws each course card on the page.
function showCourses(courses) {
  courseList.innerHTML = courses.map((course) => `
    <article class="course-card">
      <div class="course-visual ${course.color}">${course.color === "green" ? "♧" : "✦"}</div>
      <div class="course-card-top"><h3>${course.title}</h3><span class="course-tag">IN PROGRESS</span></div>
      <p>${course.subject} · ${course.lessons} lessons</p>
      <div class="progress-line"><span style="width: ${course.progress}%"></span></div>
      <div class="course-footer"><span>${course.progress}% complete</span><button class="continue-button" data-course-id="${course.id}">Continue →</button></div>
    </article>
  `).join("");

  // Each Continue button opens a simple learning view.
  document.querySelectorAll(".continue-button").forEach((button) => {
    button.addEventListener("click", () => {
      const course = courses.find((item) => item.id === Number(button.dataset.courseId));
      showCourseDetails(course);
    });
  });
}

// This shows a lesson area when the student clicks Continue.
function showCourseDetails(course) {
  generatedCourse.classList.remove("hidden");
  generatedCourse.innerHTML = `
    <p class="eyebrow">LEARNING VIEW</p>
    <h2>${course.title}</h2>
    <p>Welcome back. Choose a lesson to continue learning.</p>
    <div class="generated-columns">
      <div><h3>Lesson 1</h3><p>Start with the basic ideas and important vocabulary for this course.</p><button class="lesson-button">Start lesson →</button></div>
      <div><h3>Quick check</h3><p>Test yourself after the lesson and see what you remember.</p><button class="lesson-button">Take quiz →</button></div>
    </div>
  `;
  generatedCourse.scrollIntoView({ behavior: "smooth" });
}

// This asks the backend for the courses when the page opens.
async function loadCourses() {
  const response = await fetch("/api/courses");
  const courses = await response.json();
  showCourses(courses);
}

// This sends a new topic to the backend.
courseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const topicInput = document.querySelector("#topic");
  const buildButton = courseForm.querySelector("button");

  buildButton.disabled = true;
  buildButton.innerHTML = "Generating...";

  try {
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topicInput.value })
    });

    if (!response.ok) {
      throw new Error("The server could not create the course.");
    }

    const result = await response.json();
    const content = result.content;
    generatedCourse.classList.remove("hidden");
    generatedCourse.innerHTML = `
      <p class="eyebrow">YOUR NEW COURSE</p>
      <h2>${result.course.title}</h2>
      <p>${content.overview}</p>
      <div class="generated-columns">
        <div><h3>Lessons</h3><ol>${content.lessons.map((lesson) => `<li>${lesson}</li>`).join("")}</ol></div>
        <div><h3>Quick quiz</h3><ol>${content.quiz.map((question) => `<li>${question}</li>`).join("")}</ol></div>
      </div>
    `;

    topicInput.value = "";
    await loadCourses();
    generatedCourse.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    generatedCourse.classList.remove("hidden");
    generatedCourse.innerHTML = `<h2>Something went wrong</h2><p>${error.message}</p>`;
  } finally {
    buildButton.disabled = false;
    buildButton.innerHTML = "Build course <span>✦</span>";
  }
});

loadCourses();
