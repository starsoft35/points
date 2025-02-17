import React, { Component } from 'react';
import { Container, Content, Text, List, ListItem } from 'native-base';
import { NavigationItemDto } from '@points/shared';
import { Subscription } from 'rxjs';
import { Platform, StyleSheet } from 'react-native';

import { NavigationActions, withNavigation } from 'react-navigation';
import { navItems } from '../../store/selectors';
import { IBaseProps } from './';
import { isUnauthorized } from '../../store/selectors/is-unauthorized';

export interface ISideBarState {
    routes: NavigationItemDto[];
}

class SideBar extends Component<IBaseProps, ISideBarState> {

    public state: ISideBarState = {
        routes: []
    };
    private isUnauthorizedSubscription?: Subscription;

    private navItemsSubscription?: Subscription;

    public componentWillMount() {
        this.navItemsSubscription = navItems().subscribe((items: NavigationItemDto[]) =>
            {
                this.setState({
                    routes: items
                });
            })

        // TODO find better place for this
        this.isUnauthorizedSubscription = isUnauthorized().subscribe((unauthorized) => {
            if (unauthorized) {
                this.props.navigation.dispatch(
                    NavigationActions.navigate({
                        routeName: 'Home'
                    })
                );
            }
        });
    }

    public componentWillUnmount() {
        this.navItemsSubscription!.unsubscribe();
        this.isUnauthorizedSubscription!.unsubscribe();
    }

    public render(): JSX.Element {

        let styles = {
            sidebarList: {}
         };

        if(Platform.OS === 'ios'){
            styles.sidebarList = {
                ...styles.sidebarList,
                paddingTop: 20
            }
        }

        const styleSheet = StyleSheet.create(styles);

        return (
            <Container>
                <Content>
                    <List
                        style={styleSheet.sidebarList}
                        dataArray={this.state.routes}
                        renderRow={(data: NavigationItemDto) => {
                            return (
                                <ListItem
                                    button
                                    onPress={() => {
                                        this.props.navigation.dispatch(
                                            NavigationActions.navigate({
                                                routeName: data.route === 'Logout'
                                                    ? 'Home'
                                                    : `${data.route}`
                                            })
                                        );
                                    }}>
                                    <Text>{data.name}</Text>
                                </ListItem>
                            );
                        }}
                    />
                </Content>
            </Container>
        );
    }
}

export default withNavigation(SideBar);
