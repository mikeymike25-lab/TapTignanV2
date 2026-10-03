import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Finding } from '@/types';

interface FindingItemProps {
  finding: Finding;
}

export function FindingItem({ finding }: FindingItemProps) {
  const isPassed = finding.passed;

  return (
    <View style={[styles.container, isPassed ? styles.passedBg : styles.failedBg]}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={isPassed ? 'checkmark-circle' : 'close-circle'}
          size={22}
          color={isPassed ? '#16a34a' : '#dc2626'}
        />
      </View>

      <View style={styles.contentWrap}>
        <View style={styles.titleRow}>
          <Text style={styles.ruleId}>[{finding.ruleId}]</Text>
          <Text style={[styles.title, !isPassed && styles.failedTitle]}>
            {finding.title}
          </Text>
        </View>

        <Text style={styles.explanation}>{finding.explanation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  passedBg: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  failedBg: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
  },
  iconWrap: {
    marginTop: 2,
    marginRight: 10,
  },
  contentWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  ruleId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a1e4a',
  },
  failedTitle: {
    color: '#dc2626',
  },
  explanation: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 3,
    lineHeight: 18,
  },
});
