<template>
  <div>
    <Query query="{ posts { id title } }" v-slot="{ data }">
      <div v-if="data">
        <ul>
          <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
        </ul>
      </div>
    </Query>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>
