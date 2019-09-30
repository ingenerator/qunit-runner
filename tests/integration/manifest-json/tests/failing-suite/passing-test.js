$(function () {

    QUnit.module("passing tests", {});

    QUnit.test('should pass comparing objects', function (assert) {
        var one = {some: "content", other: {stuff: "here"}},
            two = {some: "content", other: {stuff: "here"}};

        assert.deepEqual(one, two, 'Should be the same');
    });

    QUnit.test('should continue after async test', function (assert) {
        var ready = assert.async();
        assert.expect(1);
        setTimeout(function () {
                assert.ok(true, 'It is true');
                ready();
            },
            0
        );
    });

    QUnit.test('source 1 has been loaded', function (assert) {
        assert.equal(true, window.ingen.test1, 'Global value should have been set by test source 1');
    });

    QUnit.test('source 2 has been loaded and in correct sequence', function (assert) {
        assert.equal('test 2 is loaded', window.ingen.test2, 'Global value should have been overridden by test source 2');
    });

});
