<template>
  <ul>
    <li v-for="item in data.allPets" :key="item.id">
      <span>{{ icons[item.category] }}</span>
      <span>{{ item.name }}</span>
    </li>
  </ul>
</template>

<script>
import { useQuery } from "villus";

export default {
  async setup() {
    const icons = {
      CAT: '🐱',
      DOG: '🐶',
      RABBIT: '🐰',
      STINGRAY: '🐟',
    };

    const { data, fetching } = await useQuery.suspend({
      query: `
      query AllPets {
        allPets {
          id
          name
          category
          photo {
            thumb
            full
          }
        }
      }
      `
    });

    return { data, icons };
  }
}
</script>