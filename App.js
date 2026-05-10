import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Platform, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data (In real app, fetch from API or Github raw file)
const INITIAL_DATA = [
    {
        id: "2026001",
        title: "2026년 중앙부처 및 지자체 창업지원사업 통합공고",
        organization: "중소벤처기업부",
        category: "support",
        deadline: "2026-12-31",
        dDay: "D-365"
    },
    {
        id: "2026002",
        title: "2026년 청년창업사관학교 16기 입교생 모집",
        organization: "중소벤처기업진흥공단",
        category: "support",
        deadline: "2026-02-12",
        dDay: "D-43"
    },
    {
        id: "2026006",
        title: "도전! K-스타트업 2026 혁신창업리그 참가자 모집",
        organization: "중소벤처기업부",
        category: "contest",
        deadline: "2026-04-30",
        dDay: "D-120"
    }
];

export default function App() {
    const [currentTab, setCurrentTab] = useState('home'); // home, search, settings
    const [keywords, setKeywords] = useState(['청년창업', 'R&D']);
    const [pushEnabled, setPushEnabled] = useState(true);

    const renderContent = () => {
        switch (currentTab) {
            case 'home': return <HomeScreen />;
            case 'search': return <SearchScreen />;
            case 'settings': return <SettingsScreen
                keywords={keywords}
                setKeywords={setKeywords}
                pushEnabled={pushEnabled}
                setPushEnabled={setPushEnabled}
            />;
            default: return <HomeScreen />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>BizSupport<Text style={styles.highlight}>.kr</Text></Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {renderContent()}
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <NavItem icon="🏠" label="홈" active={currentTab === 'home'} onPress={() => setCurrentTab('home')} />
                <NavItem icon="🔍" label="검색" active={currentTab === 'search'} onPress={() => setCurrentTab('search')} />
                <NavItem icon="⚙️" label="설정" active={currentTab === 'settings'} onPress={() => setCurrentTab('settings')} />
            </View>
        </SafeAreaView>
    );
}

// Components
const NavItem = ({ icon, label, active, onPress }) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
        <Text style={[styles.navIcon, active && styles.activeText]}>{icon}</Text>
        <Text style={[styles.navLabel, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
);

const ProgramCard = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>지원사업</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardInfo}>{item.organization}</Text>
        <Text style={styles.cardInfo}>~ {item.deadline} ({item.dDay})</Text>
        <TouchableOpacity style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>자세히 보기</Text>
        </TouchableOpacity>
    </View>
);

// Screens
const HomeScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heroTitle}>당신의 비즈니스를 위한{'\n'}최적의 지원 사업</Text>
        {INITIAL_DATA.map(item => <ProgramCard key={item.id} item={item} />)}
    </ScrollView>
);

const SearchScreen = () => (
    <View style={styles.screenContainer}>
        <TextInput
            style={styles.input}
            placeholder="키워드를 검색해보세요"
            placeholderTextColor="#94a3b8"
        />
        <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
    </View>
);

const SettingsScreen = ({ keywords, setKeywords, pushEnabled, setPushEnabled }) => {
    const [newKeyword, setNewKeyword] = useState('');

    const addKeyword = () => {
        if (newKeyword && !keywords.includes(newKeyword)) {
            setKeywords([...keywords, newKeyword]);
            setNewKeyword('');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>알림 설정</Text>
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>푸시 알림 받기</Text>
                <TouchableOpacity onPress={() => setPushEnabled(!pushEnabled)}>
                    <Text style={[styles.toggle, pushEnabled ? styles.toggleOn : styles.toggleOff]}>
                        {pushEnabled ? 'ON' : 'OFF'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>관심 키워드</Text>
            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newKeyword}
                    onChangeText={setNewKeyword}
                    placeholder="키워드 추가"
                    placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity style={styles.addBtn} onPress={addKeyword}>
                    <Text style={styles.addBtnText}>추가</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
                {keywords.map(k => (
                    <TouchableOpacity key={k} style={styles.tag} onPress={() => setKeywords(keywords.filter(item => item !== k))}>
                        <Text style={styles.tagText}>#{k} ⨉</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    logo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    highlight: {
        color: '#3b82f6',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    bottomNav: {
        height: 60,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#1e293b',
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    navLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    activeText: {
        color: '#3b82f6',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 30,
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bqold',
        color: 'white',
        marginBottom: 10,
    },
    cardInfo: {
        color: '#94a3b8',
        marginBottom: 5,
    },
    badgeContainer: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginBottom: 10,
    },
    badgeText: {
        color: '#60a5fa',
        fontSize: 12,
        fontWeight: 'bold',
    },
    detailBtn: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 15,
        alignItems: 'flex-end',
    },
    detailBtnText: {
        color: '#3b82f6',
        fontWeight: 'bold',
    },
    // Settings Styles
    sectionTitle: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 15,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 20,
        borderRadius: 12,
    },
    settingLabel: {
        color: 'white',
        fontSize: 16,
    },
    toggle: {
        fontSize: 14,
        fontWeight: 'bold',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    toggleOn: {
        backgroundColor: '#3b82f6',
        color: 'white',
    },
    toggleOff: {
        backgroundColor: '#475569',
        color: '#94a3b8',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: 'white',
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15,
    },
    addBtn: {
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    addBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tagText: {
        color: '#94a3b8',
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 50,
    }
});
