'use strict'
import React, { Component } from 'react';
import {
  AppRegistry,
  Alert,
  StyleSheet,
  View,
  Text,
  Navigator,
  WebView,
  BackAndroid,
  TouchableOpacity,
  Image,
  ListView,
  ProgressBarAndroid
} from 'react-native';

var _navigator;

BackAndroid.addEventListener('hardwareBackPress', () => {
  if (_navigator.getCurrentRoutes().length === 1) {
    return false;
  }
  _navigator.pop();
  return true;
});

const api = 'http://news-at.zhihu.com/api/4/news/latest';
const apiPost = 'http://news-at.zhihu.com/api/4/news/';
class MyPaper extends Component {
    render() {
      return (
        <Navigator
          initialRoute={{id: 'DashBoard'}}
          renderScene={this.navigatorRenderScene}/>
      );    
    }
    navigatorRenderScene(route, navigator) {
      _navigator = navigator;
      switch (route.id) {
        case 'DashBoard':
          return (<DashBoard navigator={navigator} />);
        case 'Post':
          return (
                <WebView 
                    source={{uri:route.url}} />
            );
      }
    }
}

class DashBoard extends Component {
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = {
            dataSource: ds,
            loaded: false
        }
    }

    componentDidMount() {
      this.fetchData();
    }

    render() {
        if (!this.state.loaded) {
           return (
                <View style={styles.container}>
                  <ProgressBarAndroid styleAttr="Inverse" />
                </View>
            );
        }

        return (
              <ListView
                  dataSource={this.state.dataSource}
                  renderRow={(data) => this.renderItem(data)}
                  style={styles.listView} />
          );
    }


    fetchData = () => {
        fetch(api)
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(data.stories),
                    loaded: true,
                });
            })
            .done();
    }

    renderItem(data) {
      return (
          <ListItem rowData={data}
                            navigator={this.props.navigator} />
      );
    }
}

class ListItem extends Component {
    constructor(props) {
        super(props);
        this.id = this.props.rowData.id;
        this.onPress = this.onPress.bind(this);
    }

    onPress() {
        var url = apiPost + this.id;
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
              var url = data.share_url;
              this.props.navigator.push({
                  id: 'Post',
                  url: url,
              });
          })
          .done();
    }

    render() {
        var image = this.props.rowData.images[0];
        return (
          <TouchableOpacity
              style={styles.container}
              onPress={this.onPress} >
              <Image style={styles.img}
                     source={{uri:image}}
              />
              <Text style={styles.text}>{this.props.rowData.title}</Text>
          </TouchableOpacity>
        );
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  listView: {
    flex: 1,
  },
  img: {
    height: 56,
    width: 56,
  },
  text: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  }
});

AppRegistry.registerComponent('MyPaper', () => MyPaper);
