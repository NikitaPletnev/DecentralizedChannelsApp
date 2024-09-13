import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import { create } from 'ipfs-core';

interface Message {
    sender: string;
    content: string;
    timestamp: string;
}

const App = () => {
    const [channelId, setChannelId] = useState<string>('');
    const [newChannelName, setNewChannelName] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [ipfsNode, setIpfsNode] = useState<any>(null);
    
    // Initialize IPFS node on component mount
    useEffect(() => {
        const initIpfs = async () => {
            try {
                const node = await create();
                setIpfsNode(node);
                console.log('IPFS node initialized');
            } catch (error) {
                console.error('Error initializing IPFS node:', error);
            }
        };
        initIpfs();
        console.log("GERE")
    }, []);
    
    // Create a new channel
    const createChannel = async () => {
        if (!newChannelName) {
            console.log('Please enter a channel name.');
            return;
        }
        
        const channelData = {
            channelName: newChannelName,
            messages: [],
            createdAt: new Date().toISOString(),
        };
        
        if (ipfsNode) {
            try {
                const { cid } = await ipfsNode.add(JSON.stringify(channelData));
                setChannelId(cid.toString());
                setMessages([]);
                setNewChannelName('');
                console.log(`Channel created with CID: ${cid}`);
            } catch (error) {
                console.error('Error creating channel:', error);
            }
        }
    };
    
    // Send a message to the channel
    const sendMessage = async () => {
        if (!newMessage) {
            console.log('Please enter a message.');
            return;
        }
        
        if (ipfsNode && channelId) {
            try {
                // Fetch existing channel data
                const stream = ipfsNode.cat(channelId);
                let data = '';
                for await (const chunk of stream) {
                    data += chunk.toString();
                }
                const channelData = JSON.parse(data);
                
                // Create new message
                const newMsg: Message = {
                    sender: 'User', // Replace with actual user ID or name
                    content: newMessage,
                    timestamp: new Date().toISOString(),
                };
                
                // Add new message to channel
                channelData.messages.push(newMsg);
                
                // Update channel data in IPFS
                const { cid } = await ipfsNode.add(JSON.stringify(channelData));
                setChannelId(cid.toString());
                setMessages(channelData.messages);
                setNewMessage('');
                console.log(`Message added. Updated Channel CID: ${cid}`);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else {
            console.log('Please create or join a channel first.');
        }
    };
    
    // Load messages from the channel
    const loadMessages = async () => {
        if (ipfsNode && channelId) {
            try {
                const stream = ipfsNode.cat(channelId);
                let data = '';
                for await (const chunk of stream) {
                    data += chunk.toString();
                }
                const channelData = JSON.parse(data);
                setMessages(channelData.messages);
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        } else {
            console.log('Please create or join a channel first.');
        }
    };
    
    return (
        <View>
            MAIN SCREEN
            {/*<Text style={styles.title}>Decentralized Channels App</Text>*/}
            {/*<TextInput*/}
            {/*    style={styles.input}*/}
            {/*    placeholder="Enter new channel name"*/}
            {/*    value={newChannelName}*/}
            {/*    onChangeText={setNewChannelName}*/}
            {/*/>*/}
            {/*<Button title="Create Channel" onPress={createChannel} />*/}
            {/*<Text style={styles.channelInfo}>Channel ID: {channelId}</Text>*/}
            {/*<TextInput*/}
            {/*    style={styles.input}*/}
            {/*    placeholder="Enter message"*/}
            {/*    value={newMessage}*/}
            {/*    onChangeText={setNewMessage}*/}
            {/*/>*/}
            {/*<Button title="Send Message" onPress={sendMessage} />*/}
            {/*<Button title="Load Messages" onPress={loadMessages} />*/}
            {/*<ScrollView style={styles.messagesContainer}>*/}
            {/*    {messages.map((msg, index) => (*/}
            {/*        <View key={index} style={styles.messageItem}>*/}
            {/*            <Text style={styles.messageSender}>{msg.sender}:</Text>*/}
            {/*            <Text style={styles.messageContent}>{msg.content}</Text>*/}
            {/*            <Text style={styles.messageTimestamp}>{msg.timestamp}</Text>*/}
            {/*        </View>*/}
            {/*    ))}*/}
            {/*</ScrollView>*/}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        marginTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
    },
    input: {
        borderColor: '#888',
        borderWidth: 1,
        padding: 8,
        marginVertical: 8,
    },
    channelInfo: {
        marginVertical: 8,
        fontStyle: 'italic',
    },
    messagesContainer: {
        flex: 1,
        marginTop: 16,
    },
    messageItem: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#f1f1f1',
    },
    messageSender: {
        fontWeight: 'bold',
    },
    messageContent: {
        marginTop: 4,
    },
    messageTimestamp: {
        marginTop: 4,
        fontSize: 12,
        color: '#555',
    },
});

export default App;
