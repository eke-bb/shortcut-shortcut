import Vue from "/vendor/vue/dist/vue.esm.browser.js";

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

async function read(key, cb) {
  let value = localStorage.getItem(key);
  if (typeof value === "string") {
    return JSON.parse(value);
  }

  value = await cb();

  write(key, value);

  return value;
}

const Task = {};
const Story = {
  name: "",
  description: "",
  epic_id: "",
  owner_ids: [],
  requested_by_id: null,
  story_type: "bug" | "chore" | "feature",
  tasks: [],
  workflow_state_id: "",
};
const app = new Vue({
  el: "#app",
  data: {
    apiKey: null,
    loading: {
      epics: {},
    },
    models: {
      workflowId: 500000005,
      milestoneId: null,
      groupId: "61d86fb2-0756-4ac1-b4c0-244d33228f4b",
      groups: [],
      members: [],
      epics: [],
      stories: [],
      storyTypes: ["bug", "chore", "feature"],
      workflowStates: [],
      defaultNewStory: {
        name: "",
        description: "",
        owner_ids: [],
        group_id: "61d86fb2-0756-4ac1-b4c0-244d33228f4b",
        story_type: "chore",
        workflow_state_id: "500000732",
      },
      newStory: {
        name: "",
        description: "",
        group_id: "61d86fb2-0756-4ac1-b4c0-244d33228f4b",
        owner_ids: [],
        story_type: "chore",
        workflow_state_id: "500000732",
      },
    },
  },
  async mounted() {
    const response = await fetch("/api/config");
    const data = await response.json();
    this.apiKey = data.shortcut_api_key;

    await this.loadWorkflowStates();
    await this.loadMembers(this.models.groupId);
    await this.loadGroups();
    await this.loadEpics();
  },
  methods: {
    async loadEpics() {
      if (!this.models.milestoneId) {
        console.log("not loading epics because milestoneId is empty");
        return;
      }

      const response = await fetch("https://api.app.shortcut.com/api/v3/epics", {
        headers: {
          "Shortcut-Token": this.apiKey,
        },
      });
      const data = await response.json();
      this.models.epics = data.filter((epic) => epic.milestone_id == this.models.milestoneId);
    },

    async loadGroups() {
      const response = await fetch("https://api.app.shortcut.com/api/v3/groups", {
        headers: {
          "Shortcut-Token": this.apiKey,
        },
      });

      const data = await response.json();
      this.models.groups = data;
    },

    async loadMembers(groupId) {
      const response = await fetch("https://api.app.shortcut.com/api/v3/members", {
        headers: {
          "Shortcut-Token": this.apiKey,
        },
      });

      const data = await response.json();
      console.log({ members: data });
      this.models.members = data.filter((member) => member.group_ids.includes(groupId));
    },

    removeEpicFromList(epic) {
      this.models.epics = this.models.epics.filter((e) => e.id != epic.id);
    },

    async loadWorkflowStates() {
      const response = await fetch(
        `https://api.app.shortcut.com/api/v3/workflows/${this.models.workflowId}`,
        {
          headers: {
            "Shortcut-Token": this.apiKey,
          },
        },
      );
      const data = await response.json();
      this.models.workflowStates = data.states;
    },

    addNewStory() {
      this.models.stories.push(Object.assign({}, this.models.newStory));
      this.models.newStory = Object.assign({}, this.models.defaultNewStory);
    },

    async createStories() {
      for (let story in this.models.stories) {
      }
    },

    async saveAllStories() {
      for (let story of this.models.stories) {
        for (let epic of this.models.epics) {
          story.epic_id = epic.id;

          try {
            console.log(JSON.stringify(story));
            const response = await fetch("https://api.app.shortcut.com/api/v3/stories", {
              method: "POST",
              headers: {
                "Shortcut-Token": this.apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(story),
            });
            const data = await response.json();
            console.log({ epic_id: epic.id, response: data });
            this.models.stories = [];
          } catch (err) {
            console.log("request error", { msg: err.message, err });
          }
        }
      }
    },

    removeStory(index) {
      const keep = [];

      for (let i = 0; i < this.models.stories.length; i++) {
        if (i === index) {
          continue;
        }

        keep.push(this.models.stories[i]);
      }

      this.models.stories = keep;
    },
  },
});
