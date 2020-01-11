<template>
  <div id="app">
    <PetListing />
  </div>
</template>

<script>
import { ref } from "vue";
import { useClient } from "villus";
import PetListing from "./components/PetListing.vue";

export default {
  components: {
    PetListing
  },
  setup() {
    useClient({
      url: "https://pet-library.moonhighway.com/"
    });
  }
};
</script>

<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style>


<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>