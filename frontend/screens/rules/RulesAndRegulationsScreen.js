import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import MainLayout from '../../components/MainLayout';
import AppBar from '../../components/AppBar';
import { useNavigation } from '../../context/NavigationContext';
import migrantRulesData from '../../data/rules/migrantRules.json';

const { width } = Dimensions.get('window');

const RulesAndRegulationsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { openDrawer } = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedRule, setExpandedRule] = useState(null);
  const [showVideos, setShowVideos] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  const currentLanguage = i18n.language || 'en';
  
  // Text-to-Speech functionality
  const speakText = async (text) => {
    try {
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
        return;
      }
      
      setIsSpeaking(true);
      
      // Language mapping for speech
      const speechLanguages = {
        'en': 'en-US',
        'ta': 'ta-IN',
        'ml': 'ml-IN',
        'hi': 'hi-IN'
      };
      
      const options = {
        language: speechLanguages[currentLanguage] || 'en-US',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      };
      
      await Speech.speak(text, options);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      Alert.alert(t('common.error'), t('rules.speechError'));
    }
  };
  
  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);
  
  // Category Tab Component
  const CategoryTab = ({ category, index, isSelected }) => (
    <TouchableOpacity
      style={[styles.categoryTab, isSelected && styles.selectedCategoryTab]}
      onPress={() => setSelectedCategory(index)}
    >
      <Text style={[styles.categoryTabText, isSelected && styles.selectedCategoryTabText]}>
        {category.title[currentLanguage]}
      </Text>
    </TouchableOpacity>
  );
  
  // Rule Card Component
  const RuleCard = ({ rule, categoryIndex, ruleIndex }) => {
    const isExpanded = expandedRule === `${categoryIndex}-${ruleIndex}`;
    const ruleId = `${categoryIndex}-${ruleIndex}`;
    
    return (
      <View style={styles.ruleCard}>
        <TouchableOpacity
          style={styles.ruleHeader}
          onPress={() => setExpandedRule(isExpanded ? null : ruleId)}
        >
          <View style={styles.ruleHeaderLeft}>
            <Text style={styles.ruleTitle}>{rule.title[currentLanguage]}</Text>
          </View>
          <View style={styles.ruleHeaderRight}>
            <TouchableOpacity
              style={styles.speakButton}
              onPress={() => speakText(rule.content[currentLanguage])}
            >
              <Ionicons 
                name={isSpeaking ? "volume-high" : "volume-medium"} 
                size={20} 
                color="#4B7BEC" 
              />
            </TouchableOpacity>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#64748B"
            />
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.ruleContent}>
            <Text style={styles.ruleText}>{rule.content[currentLanguage]}</Text>
          </View>
        )}
      </View>
    );
  };
  
  // Video Card Component
  const VideoCard = ({ video }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => setCurrentVideo(video)}
    >
      <View style={styles.videoThumbnail}>
        <Ionicons name="play-circle" size={48} color="#FF0000" />
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{video.title[currentLanguage]}</Text>
        <Text style={styles.videoDescription}>{video.description[currentLanguage]}</Text>
      </View>
    </TouchableOpacity>
  );
  
  // YouTube Video Modal
  const VideoModal = () => {
    if (!currentVideo) return null;
    
    const youtubeUrl = `https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&rel=0`;
    
    return (
      <View style={styles.videoModal}>
        <SafeAreaView style={styles.videoModalContent}>
          <View style={styles.videoModalHeader}>
            <Text style={styles.videoModalTitle}>{currentVideo.title[currentLanguage]}</Text>
            <TouchableOpacity
              style={styles.closeVideoButton}
              onPress={() => setCurrentVideo(null)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <WebView
            source={{ uri: youtubeUrl }}
            style={styles.videoWebView}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </SafeAreaView>
      </View>
    );
  };
  
  return (
    <MainLayout navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4B7BEC" translucent={true} />
        
        <AppBar
          title={t('rules.title')}
          showMenuButton={true}
          onMenuPress={openDrawer}
        />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>{t('rules.subtitle')}</Text>
            <Text style={styles.headerDescription}>{t('rules.description')}</Text>
          </View>
          
          {/* Main Content Toggle */}
          <View style={styles.contentToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, !showVideos && styles.activeToggleButton]}
              onPress={() => setShowVideos(false)}
            >
              <Ionicons name="document-text" size={20} color={!showVideos ? "#FFFFFF" : "#4B7BEC"} />
              <Text style={[styles.toggleButtonText, !showVideos && styles.activeToggleButtonText]}>
                {t('rules.rulesTab')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toggleButton, showVideos && styles.activeToggleButton]}
              onPress={() => setShowVideos(true)}
            >
              <Ionicons name="videocam" size={20} color={showVideos ? "#FFFFFF" : "#4B7BEC"} />
              <Text style={[styles.toggleButtonText, showVideos && styles.activeToggleButtonText]}>
                {t('rules.videosTab')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {!showVideos ? (
            <>
              {/* Category Tabs */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabsContainer}
                contentContainerStyle={styles.categoryTabsContent}
              >
                {migrantRulesData.categories.map((category, index) => (
                  <CategoryTab
                    key={category.id}
                    category={category}
                    index={index}
                    isSelected={selectedCategory === index}
                  />
                ))}
              </ScrollView>
              
              {/* Rules Content */}
              <View style={styles.rulesContainer}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>
                    {migrantRulesData.categories[selectedCategory]?.title[currentLanguage]}
                  </Text>
                  <TouchableOpacity
                    style={styles.speakAllButton}
                    onPress={() => {
                      const allRulesText = migrantRulesData.categories[selectedCategory]?.rules
                        .map(rule => `${rule.title[currentLanguage]}. ${rule.content[currentLanguage]}`)
                        .join('. ');
                      speakText(allRulesText);
                    }}
                  >
                    <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                    <Text style={styles.speakAllButtonText}>{t('rules.speakAll')}</Text>
                  </TouchableOpacity>
                </View>
                
                {migrantRulesData.categories[selectedCategory]?.rules.map((rule, ruleIndex) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    categoryIndex={selectedCategory}
                    ruleIndex={ruleIndex}
                  />
                ))}
              </View>
            </>
          ) : (
            /* Videos Section */
            <View style={styles.videosContainer}>
              <Text style={styles.videosTitle}>{t('rules.educationalVideos')}</Text>
              <Text style={styles.videosDescription}>{t('rules.videosDescription')}</Text>
              
              {migrantRulesData.videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </View>
          )}
        </ScrollView>
        
        {/* Video Modal */}
        {currentVideo && <VideoModal />}
      </SafeAreaView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#4B7BEC',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  contentToggle: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeToggleButton: {
    backgroundColor: '#4B7BEC',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B7BEC',
    marginLeft: 8,
  },
  activeToggleButtonText: {
    color: '#FFFFFF',
  },
  categoryTabsContainer: {
    marginBottom: 20,
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategoryTab: {
    backgroundColor: '#4B7BEC',
    borderColor: '#4B7BEC',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedCategoryTabText: {
    color: '#FFFFFF',
  },
  rulesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C55',
    flex: 1,
  },
  speakAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  speakAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  ruleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  ruleHeaderLeft: {
    flex: 1,
  },
  ruleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2C55',
    marginBottom: 4,
  },
  speakButton: {
    padding: 8,
    marginRight: 8,
  },
  ruleContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ruleText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 12,
  },
  videosContainer: {
    padding: 20,
  },
  videosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C55',
    marginBottom: 8,
  },
  videosDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoThumbnail: {
    height: 180,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2C55',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  videoModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  videoModalContent: {
    flex: 1,
  },
  videoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  videoModalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeVideoButton: {
    padding: 8,
  },
  videoWebView: {
    flex: 1,
  },
});

export default RulesAndRegulationsScreen;