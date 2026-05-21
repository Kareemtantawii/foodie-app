import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Data
const categories = ['Pizza', 'Burger', 'Salad', 'Pasta', 'Sushi', 'Dessert', 'Breakfast', 'Vegan', 'Seafood', 'Soup'];
const allRecipes = {
  Pizza: [{ id: 'p1', name: 'Margherita', image: 'https://picsum.photos/200/150', ingredients: 'Tomato, Mozzarella, Basil', instructions: 'Bake at 220°C', prepTime: '20 min', servings: 2, calories: 250, difficulty: 'Easy' }],
  Burger: [{ id: 'b1', name: 'Cheeseburger', image: 'https://picsum.photos/200/151', ingredients: 'Beef, Cheese, Lettuce', instructions: 'Grill patty, assemble', prepTime: '15 min', servings: 1, calories: 500, difficulty: 'Medium' }],
  Salad: [{ id: 's1', name: 'Caesar', image: 'https://picsum.photos/200/152', ingredients: 'Lettuce, Croutons, Dressing', instructions: 'Mix', prepTime: '10 min', servings: 2, calories: 180, difficulty: 'Easy' }],
  Pasta: [{ id: 'pa1', name: 'Carbonara', image: 'https://picsum.photos/200/153', ingredients: 'Pasta, Eggs, Bacon', instructions: 'Cook pasta, add sauce', prepTime: '25 min', servings: 2, calories: 400, difficulty: 'Medium' }],
  Sushi: [{ id: 'su1', name: 'California Roll', image: 'https://picsum.photos/200/154', ingredients: 'Rice, Nori, Avocado', instructions: 'Roll', prepTime: '30 min', servings: 2, calories: 300, difficulty: 'Hard' }],
  Dessert: [{ id: 'd1', name: 'Cheesecake', image: 'https://picsum.photos/200/155', ingredients: 'Cream cheese, Sugar, Eggs', instructions: 'Bake', prepTime: '60 min', servings: 6, calories: 450, difficulty: 'Medium' }],
  Breakfast: [{ id: 'br1', name: 'Pancakes', image: 'https://picsum.photos/200/156', ingredients: 'Flour, Milk, Eggs', instructions: 'Mix, fry', prepTime: '10 min', servings: 2, calories: 350, difficulty: 'Easy' }],
  Vegan: [{ id: 'v1', name: 'Vegan Bowl', image: 'https://picsum.photos/200/157', ingredients: 'Quinoa, Veggies', instructions: 'Combine', prepTime: '15 min', servings: 1, calories: 320, difficulty: 'Easy' }],
  Seafood: [{ id: 'se1', name: 'Grilled Shrimp', image: 'https://picsum.photos/200/158', ingredients: 'Shrimp, Lemon', instructions: 'Grill', prepTime: '10 min', servings: 2, calories: 200, difficulty: 'Easy' }],
  Soup: [{ id: 'so1', name: 'Tomato Soup', image: 'https://picsum.photos/200/159', ingredients: 'Tomato, Cream', instructions: 'Boil, blend', prepTime: '20 min', servings: 2, calories: 150, difficulty: 'Easy' }],
};

// Main Feed Screen
const FeedScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Pizza');
  const [favorites, setFavorites] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);

  useEffect(() => {
    loadFavorites();
    loadUserRecipes();
  }, []);

  const loadFavorites = async () => {
    const favs = await AsyncStorage.getItem('favorites');
    if (favs) setFavorites(JSON.parse(favs));
  };
  const loadUserRecipes = async () => {
    const recipes = await AsyncStorage.getItem('userRecipes');
    if (recipes) setUserRecipes(JSON.parse(recipes));
  };
  const toggleFavorite = async (recipe) => {
    let newFavs;
    if (favorites.some(f => f.id === recipe.id)) {
      newFavs = favorites.filter(f => f.id !== recipe.id);
    } else {
      newFavs = [...favorites, recipe];
    }
    setFavorites(newFavs);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
  };
  const isFavorite = (id) => favorites.some(f => f.id === id);

  const getRecipesForCategory = (cat) => {
    if (cat === 'My Food') return userRecipes;
    return allRecipes[cat] || [];
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['My Food', ...categories]}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.categoryItem, selectedCategory === item && styles.selectedCat]} onPress={() => setSelectedCategory(item)}>
            <Text style={styles.categoryText}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.categoryList}
      />
      <FlatList
        data={getRecipesForCategory(selectedCategory)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.recipeCard} onPress={() => navigation.navigate('RecipeDetail', { recipe: item, isUserRecipe: selectedCategory === 'My Food' })}>
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName}>{item.name}</Text>
              <TouchableOpacity onPress={() => toggleFavorite(item)}>
                <Icon name={isFavorite(item.id) ? 'heart' : 'heart-outline'} size={24} color="red" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Recipe Detail Screen
const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipe, isUserRecipe } = route.params;
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: recipe.image }} style={styles.detailImage} />
      <Text style={styles.detailName}>{recipe.name}</Text>
      <Text style={styles.detailLabel}>Ingredients:</Text>
      <Text>{recipe.ingredients}</Text>
      <Text style={styles.detailLabel}>Instructions:</Text>
      <Text>{recipe.instructions}</Text>
      <Text style={styles.detailLabel}>Preparation time: {recipe.prepTime}</Text>
      <Text>Servings: {recipe.servings}</Text>
      <Text>Calories: {recipe.calories}</Text>
      <Text>Difficulty: {recipe.difficulty}</Text>
      {isUserRecipe && <Button title="Back" onPress={() => navigation.goBack()} />}
    </ScrollView>
  );
};

// Favorites Screen
const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    loadFavs();
    const unsubscribe = navigation.addListener('focus', loadFavs);
    return unsubscribe;
  }, []);
  const loadFavs = async () => {
    const favs = await AsyncStorage.getItem('favorites');
    if (favs) setFavorites(JSON.parse(favs));
  };
  return (
    <FlatList
      data={favorites}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.recipeCard}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} />
          <Text>{item.name}</Text>
        </View>
      )}
    />
  );
};

// Add New Recipe Screen
const AddRecipeScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const saveRecipe = async () => {
    if (!name || !ingredients || !instructions) { Alert.alert('Error', 'Please fill required fields'); return; }
    const newRecipe = {
      id: Date.now().toString(),
      name,
      image: image || 'https://picsum.photos/200/160',
      ingredients,
      instructions,
      prepTime: prepTime || '30 min',
      servings: servings || '2',
      calories: calories || '300',
      difficulty: difficulty || 'Medium',
    };
    const existing = await AsyncStorage.getItem('userRecipes');
    const userRecipes = existing ? JSON.parse(existing) : [];
    userRecipes.push(newRecipe);
    await AsyncStorage.setItem('userRecipes', JSON.stringify(userRecipes));
    Alert.alert('Success', 'Recipe added!');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput placeholder="Recipe name" value={name} onChangeText={setName} style={styles.input} />
      <Button title="Pick Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 100, height: 100, margin: 10 }} />}
      <TextInput placeholder="Ingredients (comma separated)" value={ingredients} onChangeText={setIngredients} style={styles.input} multiline />
      <TextInput placeholder="Instructions" value={instructions} onChangeText={setInstructions} style={styles.input} multiline />
      <TextInput placeholder="Preparation time" value={prepTime} onChangeText={setPrepTime} style={styles.input} />
      <TextInput placeholder="Servings" value={servings} onChangeText={setServings} style={styles.input} />
      <TextInput placeholder="Calories" value={calories} onChangeText={setCalories} style={styles.input} />
      <TextInput placeholder="Difficulty" value={difficulty} onChangeText={setDifficulty} style={styles.input} />
      <Button title="Save Recipe" onPress={saveRecipe} />
    </ScrollView>
  );
};

// My Recipes (User's own recipes with edit/delete)
const MyRecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  useEffect(() => {
    loadRecipes();
    const unsubscribe = navigation.addListener('focus', loadRecipes);
    return unsubscribe;
  }, [navigation]);
  const loadRecipes = async () => {
    const stored = await AsyncStorage.getItem('userRecipes');
    if (stored) setRecipes(JSON.parse(stored));
  };
  const deleteRecipe = async (id) => {
    const newRecipes = recipes.filter(r => r.id !== id);
    setRecipes(newRecipes);
    await AsyncStorage.setItem('userRecipes', JSON.stringify(newRecipes));
  };
  return (
    <FlatList
      data={recipes}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.recipeCard}>
          <Image source={{ uri: item.image }} style={styles.recipeImage} />
          <Text>{item.name}</Text>
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <Button title="Edit" onPress={() => navigation.navigate('EditRecipe', { recipe: item })} />
            <Button title="Delete" onPress={() => deleteRecipe(item.id)} color="red" />
          </View>
        </View>
      )}
    />
  );
};

// Edit Recipe Screen (similar to add but pre-filled)
const EditRecipeScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const [name, setName] = useState(recipe.name);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [instructions, setInstructions] = useState(recipe.instructions);
  const [prepTime, setPrepTime] = useState(recipe.prepTime);
  const [servings, setServings] = useState(recipe.servings);
  const [calories, setCalories] = useState(recipe.calories);
  const [difficulty, setDifficulty] = useState(recipe.difficulty);
  const [image, setImage] = useState(recipe.image);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const updateRecipe = async () => {
    const updated = { ...recipe, name, image, ingredients, instructions, prepTime, servings, calories, difficulty };
    const stored = await AsyncStorage.getItem('userRecipes');
    let userRecipes = stored ? JSON.parse(stored) : [];
    const index = userRecipes.findIndex(r => r.id === recipe.id);
    if (index !== -1) userRecipes[index] = updated;
    await AsyncStorage.setItem('userRecipes', JSON.stringify(userRecipes));
    Alert.alert('Success', 'Recipe updated');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <Button title="Change Image" onPress={pickImage} />
      <TextInput placeholder="Ingredients" value={ingredients} onChangeText={setIngredients} style={styles.input} multiline />
      <TextInput placeholder="Instructions" value={instructions} onChangeText={setInstructions} style={styles.input} multiline />
      <TextInput placeholder="Prep time" value={prepTime} onChangeText={setPrepTime} style={styles.input} />
      <TextInput placeholder="Servings" value={servings} onChangeText={setServings} style={styles.input} />
      <TextInput placeholder="Calories" value={calories} onChangeText={setCalories} style={styles.input} />
      <TextInput placeholder="Difficulty" value={difficulty} onChangeText={setDifficulty} style={styles.input} />
      <Button title="Save Changes" onPress={updateRecipe} />
    </ScrollView>
  );
};

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarIcon: ({ color }) => <Icon name="restaurant" size={24} color={color} /> }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarIcon: ({ color }) => <Icon name="heart" size={24} color={color} /> }} />
      <Tab.Screen name="My Food" component={MyRecipesScreen} options={{ tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} /> }} />
      <Tab.Screen name="Add Recipe" component={AddRecipeScreen} options={{ tabBarIcon: ({ color }) => <Icon name="add-circle" size={24} color={color} /> }} />
    </Tab.Navigator>
  );
}

// App with Stack Navigator (for detail back button)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe Details' }} />
        <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={{ title: 'Edit Recipe' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  categoryList: { maxHeight: 50, marginVertical: 10 },
  categoryItem: { paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 5, backgroundColor: '#eee', borderRadius: 20 },
  selectedCat: { backgroundColor: '#f0a500' },
  categoryText: { fontSize: 14 },
  recipeCard: { margin: 10, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  recipeImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
  recipeInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  recipeName: { fontSize: 16, fontWeight: 'bold' },
  detailImage: { width: '100%', height: 200 },
  detailName: { fontSize: 24, fontWeight: 'bold', margin: 10 },
  detailLabel: { fontWeight: 'bold', marginTop: 10, fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, margin: 10, borderRadius: 8 },
});
