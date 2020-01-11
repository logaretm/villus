<template>
  <div class="PetListing">
    <Suspense>
      <template #default>
        <PetList />
      </template>

      <template #fallback>
        <Spinner>Loading...</Spinner>
      </template>
    </Suspense>
  </div>
</template>

<script>
import Spinner from './Spinner.vue';
import PetList from './PetList.vue';

export default {
  name: 'PetListing',
  components: {
    PetList,
    Spinner
  }
};
</script>

<style scoped>
.PetListing {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>