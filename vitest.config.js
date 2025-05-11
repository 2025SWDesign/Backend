export default {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    coverage: {
      reporter: ['text', 'lcov'], // 텍스트/HTML 리포트 출력 (선택사항)
      include: ['src/services/**'], // ✅ 이 경로만 커버리지 포함
    },
  },
};
