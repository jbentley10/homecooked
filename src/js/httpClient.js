import axios from 'axios';
import jwtDecode from 'jwt-decode';

const httpClient = axios.create();

httpClient.getToken = function() {
  return localStorage.getItem('token');
};

httpClient.setToken = function(token) {
  localStorage.setItem('token', token);
  return token;
};

// #######################
// #HTTPCLIENT FOR User#
// #######################

httpClient.getCurrentUser = function() {
  const token = this.getToken();
  if (token) return jwtDecode(token);
  return null;
};

httpClient.logIn = function(credentials) {
  return this({
    method: 'post',
    url: '/api/users/authenticate',
    data: credentials
  }).then(serverResponse => {
    const { token } = serverResponse.data;
    if (token) {
      // sets token as an included header for all subsequent api requests
      this.defaults.headers.common.token = this.setToken(token);
      return jwtDecode(token);
    }
  });
};

// logIn and signUp functions could be combined into one since the only difference is the url we're sending a request to..
httpClient.signUp = function(userInfo) {
  return this({ method: 'post', url: '/api/users', data: userInfo }).then(
    serverResponse => {
      const token = serverResponse.data.token;
      if (token) {
        // sets token as an included header for all subsequent api requests
        this.defaults.headers.common.token = this.setToken(token);
        return jwtDecode(token);
      } else {
        return false;
      }
    }
  );
};

httpClient.logOut = function() {
  localStorage.removeItem('token');
  delete this.defaults.headers.common.token;
  return true;
};

httpClient.getUser = function(id) {
  return this({ method: 'get', url: `api/users/${id}` });
};

// #######################
// #HTTPCLIENT FOR RECIPE#
// #######################

httpClient.newRecipe = function(data) {
  return this({ method: 'post', url: '/api/recipe/add_recipe', data: data });
};

httpClient.allRecipes = function() {
  return this({ method: 'get', url: '/api/recipe/get_recipes' });
};

httpClient.allUnownedRecipes = function(id) {
  let filteredRecipes = new Promise((resolve, reject) => {
    this({ method: 'get', url: `/api/recipe/get_recipes` })
      .then(res => {
        let allRecipes = res.data;
        resolve(
          allRecipes.filter(el => {
            if (el.user) return el.user._id !== id;
            else return false;
          })
        );
      })
      .catch(err => reject(err));
  });

  return filteredRecipes;
};

httpClient.updateRecipe = function(id, info) {
  return this({
    method: 'patch',
    url: `/api/recipe/update_recipe/${id}`,
    data: info
  });
};

httpClient.userRecipes = function(id) {
  return this({ method: 'get', url: `/api/recipe/get_users_recipe/${id}` });
};

httpClient.deleteRecipe = function(id) {
  return this({ method: 'delete', url: `/api/recipe/delete_recipe/${id}` });
};

export default httpClient;
