<template>
  <div class="PetListing">
    <label for="category">Category</label>
    <select id="category" v-model="category">
      <option v-for="category in categories" :key="category.value" :value="category.value">{{ category.label }}</option>
    </select>
    <ul v-if="data">
      <li v-for="item in data.allPets" :key="item.id">
        <span>{{ icons[item.category] }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>
    <div class="SpinWrapper" v-if="fetching">
      <Spinner>
        Loading...
      </Spinner>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useQuery } from "villus";
import Spinner from './Spinner.vue';

export default {
  name: "PetListing",
  components: {
    Spinner
  },
  setup() {
    const categories = [
      { label: 'Cat', value: 'CAT' },
      { label: 'Dog', value: 'DOG' },
      { label: 'Rabbit', value: 'RABBIT' },
      { label: 'Stingray', value: 'STINGRAY' }
    ];

    const icons = {
      CAT: '🐱',
      DOG: '🐶',
      RABBIT: '🐰',
      STINGRAY: '🐟',
    };

    const category = ref(null);
    const variables = computed(() => {
      return {
        category: category.value
      };
    });

    const { data, fetching } = useQuery({
      query: `
      query AllPets ($category: PetCategory) {
        allPets (category: $category) {
          id
          name
          category
          photo {
            thumb
            full
          }
        }
      }
      `,
      variables
    });

    return { data, fetching, categories, category, icons };
  }
};
</script>

<style scoped>
.PetListing {
  position: relative;
  width: 100%;
  height: 100%;
}

.SpinWrapper {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}
</style>